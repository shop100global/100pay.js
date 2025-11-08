# Contributing to 100Pay SDK

Thank you for your interest in contributing to the 100Pay SDK! We value the contributions of each community member and want to make the contribution process as straightforward and transparent as possible.

## Code of Conduct

By participating in this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## How to Contribute

### Reporting Bugs

If you find a bug in the SDK, please create an issue in our GitHub repository with the following information:

- A clear and descriptive title
- Steps to reproduce the issue
- Expected behavior
- Actual behavior
- Screenshots or code examples, if applicable
- Environment details (SDK version, Node version, etc.)

### Suggesting Enhancements

We welcome suggestions for improvements to the SDK. To suggest an enhancement:

1. Create an issue with a clear title prefixed with "Enhancement:" or "Feature Request:"
2. Describe the enhancement you'd like to see
3. Explain why this enhancement would be useful
4. Provide examples of how this enhancement would be used

### Pull Requests

1. Fork the repository
2. Create a new branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

3. Make your changes
4. Run tests to ensure your changes don't break existing functionality:

   ```bash
   npm run verify
   ```

5. Commit your changes following the [Conventional Commits](https://www.conventionalcommits.org/) standard
6. Push your branch to your fork
7. Submit a pull request to the `main` branch of the main repository

#### Pull Request Guidelines

- Follow the coding style and formatting guidelines
- Include tests that cover your changes
- Update documentation as needed
- Keep pull requests focused on a single change
- Link to any relevant issues

## Development Setup

1. Clone the repository:

   ```bash
   git clone https://github.com/shop100global/100pay.js.git
   cd 100pay.js
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Run tests:

   ```bash
   npm test
   ```

4. Build the project:

   ```bash
   npm run build
   ```

## Commit Message Guidelines

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

- `feat:` A new feature
- `fix:` A bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, semicolons, etc.)
- `refactor:` Code refactoring
- `perf:` Performance improvements
- `test:` Adding or modifying tests
- `chore:` Changes to the build process, tooling, etc.

Example: `feat: add support for cryptocurrency transfers`

This format helps with automatic generation of changelogs and version management.

## License

By contributing to the 100Pay SDK, you agree that your contributions will be licensed under its [MIT License](LICENSE.md).
