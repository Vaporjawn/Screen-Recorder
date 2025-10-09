# Screen Recorder

A modern, cross-platform screen recording application built with Electron, React, and TypeScript.

![Main Interface](docs/screenshots/main-interface.png)

## Features

- **High-Quality Recording**: Record your entire screen or a specific window.
- **Audio Support**: Include system audio and microphone input.
- **Flexible Controls**: Start, stop, pause, and resume recordings.
- **Recording History**: Keep track of all your recordings.
- **Cross-Platform**: Works on macOS, Windows, and Linux.
- **Modern UI**: Clean and intuitive user interface built with Material-UI.

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later)
- [npm](https://www.npmjs.com/) or [yarn](https://yarnpkg.com/)

### Installation & Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/Vaporjawn/Screen-Recorder.git
    cd Screen-Recorder
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Run the application:**
    ```bash
    npm run dev
    ```

## Building for Production

To create a distributable package for your current platform, run:

```bash
npm run dist
```

You can also build for a specific platform:

-   **macOS**: `npm run dist:mac`
-   **Windows**: `npm run dist:win`
-   **Linux**: `npm run dist:linux`

The distributable files will be located in the `release/` directory.

## Contributing

Contributions are welcome! Please see our [Contributing Guidelines](CONTRIBUTING.md) to get started.

We use [GitHub Issues](https://github.com/Vaporjawn/Screen-Recorder/issues) for bug reports and feature requests, and [Discussions](https://github.com/Vaporjawn/Screen-Recorder/discussions) for general questions.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Author

-   **Victor Williams** ([@Vaporjawn](https://github.com/Vaporjawn))