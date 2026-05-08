// React Native compatible: YES (socket.io-client works in RN)
import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001';

export function useSocket(handlers) {
  const socketRef = useRef(null);
  const handlersRef = useRef(handlers);
  handlersRef.current = handlers;

  useEffect(() => {
    const socket = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    socketRef.current = socket;

    socket.on('connect', () => handlersRef.current.onConnect?.());
    socket.on('disconnect', () => handlersRef.current.onDisconnect?.());
    socket.on('connect_error', (err) => handlersRef.current.onError?.(err.message));

    const events = [
      'error',
      'room:created',
      'room:joined',
      'room:updated',
      'game:role',
      'game:phaseChange',
      'countdown:tick',
      'reveal:layer',
      'guess:incoming',
      'guess:correct',
      'guess:timeUp',
      'vote:results',
      'score:update',
      'game:end',
      'player:disconnected',
    ];

    events.forEach((event) => {
      socket.on(event, (data) => {
        const handler = handlersRef.current[event];
        if (handler) handler(data);
      });
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const emit = useCallback((event, data) => {
    socketRef.current?.emit(event, data);
  }, []);

  return { emit, socketRef };
}
