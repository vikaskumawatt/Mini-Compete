# Contributing to Mini Compete

Thank you for your interest in contributing to Mini Compete! This document provides guidelines and instructions for contributing.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally
   ```bash
   git clone https://github.com/YOUR_USERNAME/mini-compete.git
   cd mini-compete
   ```
3. **Install dependencies**
   ```bash
   yarn install
   ```
4. **Set up development environment**
   ```bash
   cp .env.example .env
   cp apps/backend/.env.example apps/backend/.env
   make dev-services  # Start Postgres + Redis
   ```
5. **Run migrations and seed**
   ```bash
   make migrate
   make seed
   ```

## Development Workflow

### Branch Naming Convention

- `feature/description` - New features
- `fix/description` - Bug fixes
- `docs/description` - Documentation changes
- `refactor/description` - Code refactoring
- `test/description` - Test additions/modifications

### Making Changes

1. **Create a feature branch**

   ```bash
   git checkout -b feature/my-new-feature
   ```

2. **Make your changes** following our coding standards

3. **Write/update tests** for your changes

4. **Run tests locally**

   ```bash
   yarn test
   yarn lint
   ```

5. **Commit your changes** with clear messages
   ```bash
   git add .
   git commit -m "feat: add user profile editing"
   ```

### Commit Message Format

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

**Types:**

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

**Examples:**

```
feat(auth): add password reset functionality
fix(registration): prevent duplicate registrations
docs(readme): update setup instructions
test(competitions): add unit tests for create endpoint
```

## Code Style

### TypeScript

- Use TypeScript strict mode
- Prefer interfaces over types for object shapes
- Use meaningful variable names
- Add JSDoc comments for public APIs

### Backend (NestJS)

- Follow NestJS best practices
- Use dependency injection
- Keep controllers thin (business logic in services)
- Use DTOs for request/response validation
- Add Swagger decorators to endpoints

### Frontend (Next.js)

- Use functional components with hooks
- Keep components small and focused
- Use Tailwind CSS utility classes
- Avoid inline styles
- Implement proper error handling

### Database

- Always create migrations for schema changes
- Never edit migration files after they're committed
- Use meaningful migration names
- Add indexes for commonly queried fields

## Testing

### Running Tests

```bash
# All tests
yarn test

# Watch mode
yarn test:watch

# Coverage
yarn test:cov

# E2E tests
yarn test:e2e
```

### Writing Tests

- Write unit tests for services
- Write integration tests for API endpoints
- Test edge cases and error conditions
- Mock external dependencies

**Example:**

```typescript
describe('CompetitionsService', () => {
  it('should create a competition', async () => {
    const dto = {
      title: 'Test Competition',
      capacity: 50,
      // ...
    };

    const result = await service.create(organizerId, dto);

    expect(result).toBeDefined();
    expect(result.title).toBe(dto.title);
  });
});
```

## Pull Request Process

1. **Update documentation** if you changed APIs or behavior

2. **Ensure all tests pass**

   ```bash
   yarn test
   yarn lint
   yarn build
   ```

3. **Update CHANGELOG.md** with your changes

4. **Push to your fork**

   ```bash
   git push origin feature/my-new-feature
   ```

5. **Create a Pull Request** on GitHub
   - Use a clear title describing the change
   - Reference any related issues
   - Provide a detailed description of changes
   - Include screenshots for UI changes

6. **Address review feedback** promptly

7. **Squash commits** if requested before merging

## Pull Request Template

```markdown
## Description

Brief description of changes

## Type of Change

- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing

- [ ] Unit tests added/updated
- [ ] Integration tests added/updated
- [ ] Manual testing performed

## Checklist

- [ ] Code follows project style guidelines
- [ ] Self-review completed
- [ ] Comments added for complex code
- [ ] Documentation updated
- [ ] No new warnings generated
- [ ] Tests pass locally

## Related Issues

Fixes #123
```

## Database Migrations

### Creating a Migration

```bash
# Make changes to schema.prisma
# Then run:
yarn workspace @mini-compete/backend prisma migrate dev --name descriptive_name
```

### Migration Best Practices

- One logical change per migration
- Test migrations on a copy of production data
- Make migrations reversible when possible
- Document breaking changes

## Adding Dependencies

1. **Install in the correct workspace**

   ```bash
   # Backend
   yarn workspace @mini-compete/backend add package-name

   # Frontend
   yarn workspace @mini-compete/frontend add package-name

   # Dev dependency
   yarn workspace @mini-compete/backend add -D package-name
   ```

2. **Justify the dependency** in your PR description

3. **Keep dependencies up to date**

## Code Review Guidelines

### For Reviewers

- Be constructive and respectful
- Explain the "why" behind suggestions
- Distinguish between must-fix and nice-to-have
- Approve when satisfied, even if minor suggestions remain

### For Authors

- Respond to all comments
- Don't take feedback personally
- Ask for clarification if needed
- Thank reviewers for their time

## Performance Considerations

- Profile before optimizing
- Add database indexes for frequent queries
- Cache expensive computations
- Use pagination for large datasets
- Monitor bundle size for frontend changes

## Security

- Never commit secrets or credentials
- Validate all user input
- Use parameterized queries (Prisma handles this)
- Sanitize output to prevent XSS
- Report security vulnerabilities privately

## Documentation

- Update README.md for setup changes
- Update ARCHITECTURE.md for design changes
- Add JSDoc comments to public APIs
- Include code examples where helpful

## Getting Help

- Check existing issues and PRs
- Ask questions in issue comments
- Join our community chat (if available)
- Reach out to maintainers

## License

By contributing, you agree that your contributions will be licensed under the project's MIT License.

## Recognition

Contributors will be added to our Contributors list in the README. Thank you for making Mini Compete better!
