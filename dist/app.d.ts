declare const createApp: () => {
    app: import("express-serve-static-core").Express;
    httpServer: import("http").Server<typeof import("http").IncomingMessage, typeof import("http").ServerResponse>;
};
export { createApp };
//# sourceMappingURL=app.d.ts.map