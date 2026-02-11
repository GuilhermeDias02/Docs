<<<<<<< HEAD
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
=======
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
>>>>>>> 95247f2 (Page, liste, button sont ok)

export default defineConfig({
<<<<<<< HEAD
  plugins: [react(), tailwindcss()],
})
=======
  plugins: [react()],
  server: {
    proxy: {
      "/socket.io": {
        target: "http://localhost:3000",
        ws: true,
      },
    },
  },
});
>>>>>>> 95247f2 (Page, liste, button sont ok)
