# 🤝 Contributing to Horizon

First off, thank you for considering contributing to Horizon! It's people like you that make Horizon such a great tool.

## 🌈 How Can I Contribute?

### Reporting Bugs
- Check the [Issues](https://github.com/dimmanramone/horizon/issues) to see if the bug has already been reported.
- If you can't find an open issue addressing the problem, [open a new one](https://github.com/dimmanramone/horizon/issues/new).
- Include a clear title, a description, as much relevant information as possible, and a code sample or an executable test case demonstrating the expected behavior that is not occurring.

### Suggesting Enhancements
- Open a [new issue](https://github.com/dimmanramone/horizon/issues/new) with the tag `enhancement`.
- Describe the feature you would like to see and why it would be useful.

### Pull Requests
- Fork the repository and create your branch from `main`.
- If you've added code that should be tested, add tests.
- If you've changed APIs, update the documentation.
- Ensure the test suite passes.
- Make sure your code lints (`npm run lint`).

## 🛠️ Development Setup

1. **Clone the repo**:
   ```bash
   git clone https://github.com/your-username/horizon.git
   ```
2. **Install dependencies**:
   ```bash
   npm install
   ```
3. **Set up environment**:
   ```bash
   cp .env.example .env.local
   ```
4. **Start the dev server**:
   ```bash
   npm run dev
   ```

## 🧩 Developing Modules
If you are interested in building new widgets or views for the dashboard, please refer to the [Module Development Guide](./DEVELOPING_PLUGINS.md).

## 📜 License
By contributing, you agree that your contributions will be licensed under its MIT License.
