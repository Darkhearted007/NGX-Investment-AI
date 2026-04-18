# NGX Investment AI - Upgrade Guide

## Current Dependency Versions
As of April 17, 2026, the project is using the following versions:

### Production Dependencies
- `react@19.2.4` - Latest: 19.2.5 (patch upgrade available)
- `react-dom@19.2.4` - Latest: 19.2.5 (patch upgrade available)
- `react-router-dom@7.14.1` - Latest: v7.x (monitor for updates)
- `@supabase/supabase-js@2.103.3` - Latest: 2.103.3 (up to date)
- `recharts@3.8.1` - Latest: 3.8.1+ (monitor for updates)

### Development Dependencies
- `@vitejs/plugin-react@6.0.1` - Requires Node.js >=20.19.0 or >=22.12.0
- `vite@8.0.4` - Requires Node.js >=20.19.0 or >=22.12.0
- `tailwindcss@4.2.2` - Latest major version
- `eslint@9.39.4` - Latest: 9.40+
- `@types/react@19.2.14` - Latest: 19.2.14+
- `@types/react-dom@19.2.3` - Latest: 19.2.3+

## Available Upgrades

### 🟢 Low Risk Upgrades (Patch/Minor)
These are safe to apply immediately:

```bash
npm update react react-dom
```

**Changes:**
- React: 19.2.4 → 19.2.5
- React DOM: 19.2.4 → 19.2.5

### ⚠️ Recommended Future Upgrades

#### 1. Node.js Version Upgrade
**Current Issue:** The current Node.js version (v20.10.0) triggers engine warnings with:
- `@vitejs/plugin-react@6.0.1`
- `vite@8.0.4`
- `rolldown` (transitive dependency)

**Solution:** Upgrade to Node.js v20.19.0 LTS or v22 LTS or later
```bash
# Using nvm (Node Version Manager)
nvm install 20.19.0
nvm use 20.19.0
```

#### 2. Vite Major Version Upgrade
**From:** vite@8.0.4
**To:** vite@6.x or latest v5.x

This requires:
- Node.js compatibility check
- Test build and dev server
- Possible configuration adjustments

```bash
npm install --save-dev vite@latest
```

#### 3. TypeScript Integration (Recommended)
The README.md suggests adding TypeScript support for better development experience:
```bash
npm install --save-dev typescript @types/node
# Then rename .jsx files to .tsx and add tsconfig.json
```

#### 4. ESLint Update
**From:** eslint@9.39.4 + eslint-plugin-react-hooks@7.0.1
**To:** eslint@9.40+ (when available)

Notice: The current eslint-plugin-react-hooks@7.0.1 has peer dependency requirements that become stricter with newer ESLint versions. Plan to upgrade in a coordinated manner.

## Upgrade Strategy

### Phase 1: Immediate (This Week)
1. Update Node.js if on Windows
2. Run `npm update` to get patch versions
3. Verify tests pass

### Phase 2: Near-term (Next Sprint)
1. Test React Router v7 latest
2. Evaluate TailwindCSS v4.3+ features
3. Check Recharts for any critical updates

### Phase 3: Major Updates (Next Quarter)
1. Plan TypeScript migration
2. Evaluate Vite v6 upgrade
3. Consider development environment optimization

## Security Audit Results
✅ **No vulnerabilities found** (as of last audit)

Run periodic security audits:
```bash
npm audit
```

## Testing After Upgrades
After any major upgrades, run:
```bash
# Install dependencies
npm install

# Lint code
npm run lint

# Build for production
npm build

# Preview production build
npm run preview

# Start development server
npm run dev
```

## Troubleshooting

### Node Engine Warnings
If you see warnings about Node.js engine incompatibility:
```
npm WARN EBADENGINE Unsupported engine
```

**Solution:** Upgrade Node.js to the required version (v20.19.0+ or v22+)

### Peer Dependency Conflicts
If installation fails with peer dependency errors:
```bash
# Use legacy peer deps flag (temporary workaround)
npm install --legacy-peer-deps

# Or force installation
npm install --force
```

### Permission Errors on Windows
If you get `EPERM: operation not permitted` errors:
```bash
# Clear npm cache
npm cache clean --force

# Remove node_modules
Remove-Item -Recurse -Force node_modules

# Reinstall
npm install
```

## References
- [React 19 Release Notes](https://react.dev)
- [Vite Migration Guide](https://vitejs.dev)
- [TailwindCSS Upgrade Guide](https://tailwindcss.com/docs/upgrade-guide)
- [ESLint Configuration](https://eslint.org/docs/rules/)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
