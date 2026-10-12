import { act, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
    WebSocketProvider,
    useWebSocket,
} from "../../../hooks/realtime/websocket/WebSocketProvider";
vi.mock("../../../hooks/connectivity/useServerConnectivity", () => ({
    useServerConnectivity: () => ({ isDesktop: false, status: "online" }),
}));
class FakeSocket {
    static OPEN = 1;
    static instances: FakeSocket[] = [];
    readyState = 0;
    bufferedAmount = 0;
    onopen: (() => void) | null = null;
    onclose: ((event: { code: number }) => void) | null = null;
    onmessage: ((event: { data: unknown }) => void) | null = null;
    onerror: (() => void) | null = null;
    send = vi.fn();
    close = vi.fn(() => {
        this.readyState = 3;
    });
    constructor(public url: string) {
        FakeSocket.instances.push(this);
    }
}
function Consumer() {
    const { status, send, reconnect } = useWebSocket();
    return (
        <>
            <output>{status}</output>
            <button onClick={() => send("hello")}>Send</button>
            <button onClick={reconnect}>Reconnect</button>
        </>
    );
}
beforeEach(() => {
    FakeSocket.instances = [];
    vi.stubGlobal("WebSocket", FakeSocket);
    vi.useFakeTimers();
});
afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
});
const flush = async () => {
    await act(async () => {
        await Promise.resolve();
    });
};
describe("opt-in WebSocket provider", () => {
    it("stays disabled by default and owns the socket per session", async () => {
        const connection = vi.fn(async () => ({ url: "wss://example.test/socket" }));
        const message = vi.fn();
        const view = (enabled?: boolean, owner = 1) => (
            <WebSocketProvider
                enabled={enabled}
                sessionKey={owner}
                getConnection={connection}
                onMessage={message}
            >
                <Consumer />
            </WebSocketProvider>
        );
        const { rerender, unmount } = render(view());
        await flush();
        expect(connection).not.toHaveBeenCalled();
        rerender(view(true));
        await flush();
        const first = FakeSocket.instances[0];
        fireEvent.click(screen.getByText("Send"));
        expect(first.send).not.toHaveBeenCalled();
        act(() => {
            first.readyState = 1;
            first.onopen?.();
        });
        expect(screen.getByText("open")).toBeTruthy();
        fireEvent.click(screen.getByText("Send"));
        expect(first.send).toHaveBeenCalledWith("hello");
        act(() => first.onmessage?.({ data: "event" }));
        expect(message).toHaveBeenCalledWith("event");
        rerender(view(true, 2));
        await flush();
        expect(first.close).toHaveBeenCalled();
        expect(first.onmessage).toBeNull();
        expect(FakeSocket.instances).toHaveLength(2);
        unmount();
        expect(FakeSocket.instances[1].close).toHaveBeenCalled();
        await act(async () => {
            await vi.advanceTimersByTimeAsync(60000);
        });
        expect(FakeSocket.instances).toHaveLength(2);
    });
    it("bounds failed reconnect attempts and permits an explicit retry", async () => {
        const connection = vi.fn(async () => {
            throw new Error("offline");
        });
        render(
            <WebSocketProvider enabled sessionKey={1} getConnection={connection}>
                <Consumer />
            </WebSocketProvider>,
        );
        await flush();
        await act(async () => {
            await vi.advanceTimersByTimeAsync(31000);
        });
        expect(connection).toHaveBeenCalledTimes(6);
        expect(screen.getByText("error")).toBeTruthy();
        fireEvent.click(screen.getByText("Reconnect"));
        await flush();
        expect(connection).toHaveBeenCalledTimes(7);
    });
    it("ignores late connection factories and does not retry policy closure", async () => {
        let resolve: (value: { url: string }) => void = () => {};
        const connection = vi.fn(
            () =>
                new Promise<{ url: string }>((done) => {
                    resolve = done;
                }),
        );
        const { rerender } = render(
            <WebSocketProvider enabled sessionKey={1} getConnection={connection}>
                <Consumer />
            </WebSocketProvider>,
        );
        rerender(
            <WebSocketProvider sessionKey={null} getConnection={connection}>
                <Consumer />
            </WebSocketProvider>,
        );
        await act(async () => {
            resolve({ url: "wss://example.test/socket" });
        });
        expect(FakeSocket.instances).toHaveLength(0);
        const ready = async () => ({ url: "wss://example.test/socket" });
        rerender(
            <WebSocketProvider enabled sessionKey={2} getConnection={ready}>
                <Consumer />
            </WebSocketProvider>,
        );
        await flush();
        act(() => FakeSocket.instances[0].onclose?.({ code: 1008 }));
        expect(screen.getByText("closed")).toBeTruthy();
        await act(async () => {
            await vi.advanceTimersByTimeAsync(60000);
        });
        expect(FakeSocket.instances).toHaveLength(1);
    });
});
