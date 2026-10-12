import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useRef,
    useState,
    type ReactNode,
} from "react";
import { useServerConnectivity } from "../../connectivity/useServerConnectivity";

export type SocketStatus = "idle" | "connecting" | "open" | "reconnecting" | "closed" | "error";
export type SocketConnection = { url: string; protocols?: string | string[] };
type SocketContextValue = {
    status: SocketStatus;
    send: (data: string) => boolean;
    reconnect: () => void;
};
const SocketContext = createContext<SocketContextValue | null>(null);

/** Opt-in transport scaffold. The caller owns endpoint, session identity and authentication. */
export function WebSocketProvider({
    children,
    enabled = false,
    sessionKey,
    getConnection,
    onMessage,
}: {
    children: ReactNode;
    enabled?: boolean;
    sessionKey: string | number | null;
    getConnection: (signal: AbortSignal) => Promise<SocketConnection>;
    onMessage?: (data: unknown) => void;
}) {
    const { isDesktop, status: connectivity } = useServerConnectivity();
    const [online, setOnline] = useState(
        () => typeof navigator === "undefined" || navigator.onLine,
    );
    const [generation, setGeneration] = useState(0);
    const reconnect = useCallback(() => setGeneration((value) => value + 1), []);
    useEffect(() => {
        const update = () => setOnline(navigator.onLine);
        window.addEventListener("online", update);
        window.addEventListener("offline", update);
        return () => {
            window.removeEventListener("online", update);
            window.removeEventListener("offline", update);
        };
    }, []);
    const available =
        online && enabled && sessionKey !== null && (!isDesktop || connectivity === "online");
    const [status, setStatus] = useState<SocketStatus>("idle");
    const socketRef = useRef<{ socket: WebSocket; owner: string | number | null } | null>(null);
    const messageRef = useRef(onMessage);
    useEffect(() => {
        messageRef.current = onMessage;
    }, [onMessage]);
    useEffect(() => {
        if (!available) {
            setStatus("idle");
            return;
        }
        let active = true;
        let attempts = 0;
        let timer: ReturnType<typeof setTimeout> | null = null;
        let socket: WebSocket | null = null;
        const controller = new AbortController();
        const retry = () => {
            if (!active || timer !== null) return;
            if (attempts >= 5) {
                setStatus("error");
                return;
            }
            const delay = Math.min(1000 * 2 ** attempts++, 30000);
            setStatus("reconnecting");
            timer = setTimeout(() => {
                timer = null;
                void connect();
            }, delay);
        };
        const connect = async () => {
            if (!active) return;
            setStatus(attempts ? "reconnecting" : "connecting");
            try {
                const connection = await getConnection(controller.signal);
                if (!active) return;
                const url = new URL(connection.url);
                if (!["ws:", "wss:"].includes(url.protocol) || url.username || url.password) {
                    setStatus("error");
                    return;
                }
                socket = new WebSocket(url.href, connection.protocols);
                const current = socket;
                socketRef.current = { socket: current, owner: sessionKey };
                current.onopen = () => {
                    if (active && socket === current) setStatus("open");
                };
                current.onmessage = (event) => {
                    if (active && socket === current) messageRef.current?.(event.data);
                };
                current.onerror = () => {
                    if (active && socket === current) current.close();
                };
                current.onclose = (event) => {
                    if (!active || socket !== current) return;
                    socketRef.current = null;
                    if (event.code === 1000 || event.code === 1008) {
                        setStatus("closed");
                        return;
                    }
                    retry();
                };
            } catch {
                if (active) retry();
            }
        };
        void connect();
        return () => {
            active = false;
            controller.abort();
            if (timer !== null) clearTimeout(timer);
            if (socket) {
                socket.onopen = null;
                socket.onmessage = null;
                socket.onerror = null;
                socket.onclose = null;
                socket.close(1000, "Provider disconnected");
            }
            socketRef.current = null;
        };
    }, [available, sessionKey, getConnection, generation]);
    const send = useCallback(
        (data: string) => {
            const owned = socketRef.current;
            if (!available || owned?.owner !== sessionKey) return false;
            const socket = owned?.socket;
            if (!socket || socket.readyState !== WebSocket.OPEN || socket.bufferedAmount > 65536)
                return false;
            try {
                socket.send(data);
                return true;
            } catch {
                return false;
            }
        },
        [available, sessionKey],
    );
    const value = useMemo(
        () => ({ status: available ? status : ("idle" as const), send, reconnect }),
        [available, status, send, reconnect],
    );
    return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}
export function useWebSocket() {
    const value = useContext(SocketContext);
    if (!value) throw new Error("useWebSocket requires WebSocketProvider");
    return value;
}
