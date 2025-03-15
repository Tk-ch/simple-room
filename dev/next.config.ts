import type { NextConfig } from "next";

const nextConfig: NextConfig = {
    transpilePackages: [
        "@tk-ch/simple-room-common",
        "@tk-ch/simple-room-server",
        "@tk-ch/simple-room-client",
    ],
};
export default nextConfig;
