/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          50: "#f7f6f2",
          100: "#ece9e1",
          200: "#d8d3c5",
          400: "#8a8576",
          600: "#4a4738",
          800: "#23211a",
        },
        moss: {
          400: "#7a8a5c",
          600: "#566a3b",
        },
        brick: {
          500: "#b35a3c",
          600: "#8f4127",
        },
      },
      fontFamily: {
        serif: ['"Microsoft YaHei"', '"微软雅黑"', '"PingFang SC"', '"Helvetica Neue"', 'sans-serif'],
        sans: ['"Microsoft YaHei"', '"微软雅黑"', '"PingFang SC"', '"Helvetica Neue"', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
