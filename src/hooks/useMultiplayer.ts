import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Json } from '@/integrations/supabase/types';

export interface GameRoom {
  id: string;
  code: string;
  host_id: string;
  game_mode: string;
  mafia_count: number;
  timer_minutes: number;
  status: string;
  game_state: Json;
}

export interface GamePlayer {
  id: string;
  room_id: string;
  player_name: string;
  avatar: string;
  device_id: string;
  role: string | null;
  is_alive: boolean;
  is_host: boolean;
}

// Generate a unique device ID
const getDeviceId = (): string => {
  let deviceId = localStorage.getItem('mafia_device_id');
  if (!deviceId) {
    deviceId = crypto.randomUUID();
    localStorage.setItem('mafia_device_id', deviceId);
  }
  return deviceId;
};

// Generate a 6-character game code
const generateCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

export const useMultiplayer = () => {
  const [room, setRoom] = useState<GameRoom | null>(null);
  const [players, setPlayers] = useState<GamePlayer[]>([]);
  const [currentPlayer, setCurrentPlayer] = useState<GamePlayer | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const deviceId = getDeviceId();

  // Subscribe to room changes
  useEffect(() => {
    if (!room?.id) return;

    const roomChannel = supabase
      .channel(`room-${room.id}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_rooms',
          filter: `id=eq.${room.id}`,
        },
        (payload) => {
          if (payload.eventType === 'DELETE') {
            setRoom(null);
            setPlayers([]);
            setCurrentPlayer(null);
            toast({ title: 'Game ended', description: 'The host has ended the game.' });
          } else if (payload.new) {
            setRoom(payload.new as GameRoom);
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'game_players',
          filter: `room_id=eq.${room.id}`,
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setPlayers((prev) => [...prev, payload.new as GamePlayer]);
          } else if (payload.eventType === 'DELETE') {
            setPlayers((prev) => prev.filter((p) => p.id !== (payload.old as GamePlayer).id));
          } else if (payload.eventType === 'UPDATE') {
            setPlayers((prev) =>
              prev.map((p) => (p.id === (payload.new as GamePlayer).id ? (payload.new as GamePlayer) : p))
            );
            // Update current player if it's us
            if ((payload.new as GamePlayer).device_id === deviceId) {
              setCurrentPlayer(payload.new as GamePlayer);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(roomChannel);
    };
  }, [room?.id, deviceId, toast]);

  const createRoom = useCallback(async (playerName: string, avatar: string, gameMode: string): Promise<string | null> => {
    setIsLoading(true);
    try {
      const code = generateCode();
      
      // Create room
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .insert({
          code,
          host_id: deviceId,
          game_mode: gameMode,
          status: 'waiting',
        })
        .select()
        .single();

      if (roomError) throw roomError;

      // Add host as first player
      const { data: playerData, error: playerError } = await supabase
        .from('game_players')
        .insert({
          room_id: roomData.id,
          player_name: playerName,
          avatar,
          device_id: deviceId,
          is_host: true,
        })
        .select()
        .single();

      if (playerError) throw playerError;

      setRoom(roomData);
      setPlayers([playerData]);
      setCurrentPlayer(playerData);
      
      return code;
    } catch (error) {
      console.error('Error creating room:', error);
      toast({ title: 'Error', description: 'Failed to create game room', variant: 'destructive' });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [deviceId, toast]);

  const joinRoom = useCallback(async (code: string, playerName: string, avatar: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Find room by code
      const { data: roomData, error: roomError } = await supabase
        .from('game_rooms')
        .select()
        .eq('code', code.toUpperCase())
        .eq('status', 'waiting')
        .maybeSingle();

      if (roomError) throw roomError;
      if (!roomData) {
        toast({ title: 'Not found', description: 'Game room not found or already started', variant: 'destructive' });
        return false;
      }

      // Check if already in room
      const { data: existingPlayer } = await supabase
        .from('game_players')
        .select()
        .eq('room_id', roomData.id)
        .eq('device_id', deviceId)
        .maybeSingle();

      if (existingPlayer) {
        // Rejoin existing
        setCurrentPlayer(existingPlayer);
      } else {
        // Add new player
        const { data: playerData, error: playerError } = await supabase
          .from('game_players')
          .insert({
            room_id: roomData.id,
            player_name: playerName,
            avatar,
            device_id: deviceId,
            is_host: false,
          })
          .select()
          .single();

        if (playerError) throw playerError;
        setCurrentPlayer(playerData);
      }

      // Fetch all players
      const { data: allPlayers } = await supabase
        .from('game_players')
        .select()
        .eq('room_id', roomData.id);

      setRoom(roomData);
      setPlayers(allPlayers || []);
      
      return true;
    } catch (error) {
      console.error('Error joining room:', error);
      toast({ title: 'Error', description: 'Failed to join game room', variant: 'destructive' });
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [deviceId, toast]);

  const leaveRoom = useCallback(async () => {
    if (!room || !currentPlayer) return;

    try {
      await supabase
        .from('game_players')
        .delete()
        .eq('id', currentPlayer.id);

      // If host leaves, delete the room
      if (currentPlayer.is_host) {
        await supabase
          .from('game_rooms')
          .delete()
          .eq('id', room.id);
      }

      setRoom(null);
      setPlayers([]);
      setCurrentPlayer(null);
    } catch (error) {
      console.error('Error leaving room:', error);
    }
  }, [room, currentPlayer]);

  const updateRoomSettings = useCallback(async (settings: { mafia_count?: number; timer_minutes?: number; game_mode?: string }) => {
    if (!room || !currentPlayer?.is_host) return;

    try {
      await supabase
        .from('game_rooms')
        .update(settings)
        .eq('id', room.id);
    } catch (error) {
      console.error('Error updating room:', error);
    }
  }, [room, currentPlayer]);

  const startGame = useCallback(async (roles: Record<string, string>) => {
    if (!room || !currentPlayer?.is_host) return;

    try {
      // Update all players with their roles
      for (const [playerId, role] of Object.entries(roles)) {
        await supabase
          .from('game_players')
          .update({ role })
          .eq('id', playerId);
      }

      // Update room status
      await supabase
        .from('game_rooms')
        .update({ status: 'playing' })
        .eq('id', room.id);
    } catch (error) {
      console.error('Error starting game:', error);
    }
  }, [room, currentPlayer]);

  const updateGameState = useCallback(async (gameState: Json) => {
    if (!room) return;

    try {
      await supabase
        .from('game_rooms')
        .update({ game_state: gameState })
        .eq('id', room.id);
    } catch (error) {
      console.error('Error updating game state:', error);
    }
  }, [room]);

  const updatePlayer = useCallback(async (playerId: string, updates: Partial<GamePlayer>) => {
    try {
      await supabase
        .from('game_players')
        .update(updates)
        .eq('id', playerId);
    } catch (error) {
      console.error('Error updating player:', error);
    }
  }, []);

  return {
    room,
    players,
    currentPlayer,
    isLoading,
    isHost: currentPlayer?.is_host || false,
    deviceId,
    createRoom,
    joinRoom,
    leaveRoom,
    updateRoomSettings,
    startGame,
    updateGameState,
    updatePlayer,
  };
};
