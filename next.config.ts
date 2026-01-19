import type { NextConfig } from "next";

/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
        turbopack: {
            // root of this app
            root: __dirname,
        },
    },
};
module.exports = nextConfig;