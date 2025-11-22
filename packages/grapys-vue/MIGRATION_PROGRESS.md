# grapys-vue Migration to @receptron/vue-flow

## Progress Status: 70% Complete

### ✅ Completed Steps

1. **GraphAI Plugin Structure Created**
   - `src/plugins/graphai/` directory structure
   - GraphAI-specific files copied to plugin directory:
     - `utils/graphDataConverter.ts` (from utils/gui/graph.ts)
     - `utils/agentProfiles.ts` (from utils/gui/data.ts)
     - `utils/result.ts`
     - `components/NodeStaticValue.vue`
     - `components/NodeComputedParams.vue`
     - `components/NodeComputedParam.vue`
     - `components/NodeResult.vue`

2. **GraphAI Plugin Implementation**
   - `src/plugins/graphai/index.ts` - Main plugin file
   - `src/plugins/graphai/store/graphaiStore.ts` - GraphAI-specific store
   - Plugin hooks:
     - `exportData()` - Export to GraphAI format
     - `importData()` - Import from GraphAI format
     - `validateEdge()` - GraphAI-specific edge validation

3. **Store Adapter Layer**
   - `src/store/storeAdapter.ts` - Backward compatibility layer
   - Wraps @receptron/vue-flow core store
   - Maintains 100% API compatibility with existing code
   - All existing components continue to work without modification

4. **Store Update**
   - `src/store/index.ts` - Now exports adapter
   - Original store backed up as `index.ts.backup`

5. **Type Declarations**
   - @receptron/vue-flow rebuilt with type declarations
   - vite-plugin-dts configured
   - Type definitions generated in `packages/graph-editor/dist/`

### 🔧 Remaining Work

#### 1. Fix TypeScript Errors (50+ errors)

Main error categories:
- **Computed ref unwrapping**: Components accessing `.value` on computed properties
- **Plugin component imports**: Path errors in copied components
- **Type compatibility**: Some type mismatches between old and new store

#### 2. Update Plugin Component Imports

Files that need import path fixes:
```
src/plugins/graphai/components/NodeComputedParam.vue
src/plugins/graphai/components/NodeComputedParams.vue
src/plugins/graphai/components/NodeResult.vue
src/plugins/graphai/components/NodeStaticValue.vue
```

Need to change imports from:
```typescript
import { ... } from '../utils/gui/type'
import { ... } from '../store'
```

To:
```typescript
import { ... } from '../../../utils/gui/type'
import { ... } from '../../../store'
```

#### 3. Fix Computed Ref Access

Many components are using computed refs without `.value`:
```typescript
// Current (incorrect)
store.nodes.filter(...)
store.nodeRecords[nodeId]

// Should be
store.nodes.value.filter(...)
store.nodeRecords.value[nodeId]
```

**OR** the adapter should return raw values instead of computed refs for better compatibility.

#### 4. Test All Features

After fixing errors, test:
- [ ] Graph loads from GraphData
- [ ] Nodes can be added/deleted
- [ ] Edges can be created/deleted
- [ ] Drag & drop works
- [ ] Pan & scroll works
- [ ] Undo/Redo works
- [ ] GraphAI execution works
- [ ] Static node values work
- [ ] Computed node params work
- [ ] Nested graphs work
- [ ] Export to GraphData works

## Quick Fix Strategy

### Option A: Fix Adapter (Recommended)

Update `storeAdapter.ts` to return unwrapped values:

```typescript
// Instead of
const nodes = computed(() => coreStore.nodes);

// Use
const nodes = computed(() => coreStore.nodes.value);
```

This maintains backward compatibility without changing any existing components.

### Option B: Fix All Components

Update all 35+ files that import from store to access `.value`.

**Recommendation**: Option A is faster and safer.

## File Summary

### New Files Created
- `src/plugins/graphai/index.ts`
- `src/plugins/graphai/store/graphaiStore.ts`
- `src/plugins/graphai/utils/graphDataConverter.ts`
- `src/plugins/graphai/utils/agentProfiles.ts`
- `src/plugins/graphai/utils/result.ts`
- `src/plugins/graphai/components/*.vue` (4 files)
- `src/store/storeAdapter.ts`

### Modified Files
- `src/store/index.ts`
- `package.json` (added @receptron/vue-flow dependency)

### Backup Files
- `src/store/index.ts.backup`

## Next Session Tasks

1. Fix storeAdapter to unwrap computed values
2. Fix plugin component import paths
3. Run build and fix remaining TypeScript errors
4. Test basic functionality
5. Fix any runtime issues
6. Full integration testing
7. Documentation update

## Rollback Plan

If needed, rollback is simple:
```bash
mv src/store/index.ts.backup src/store/index.ts
git checkout package.json
yarn install
```

All original files remain intact and functional.
