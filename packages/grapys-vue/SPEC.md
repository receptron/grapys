# Grapys-Vue Graph Editor Component Specification

## Overview

Grapys-Vueは、ノードとエッジでグラフ構造を視覚的に作成・編集するためのVue 3コンポーネント群です。React-flowのVue版に相当し、ドラッグ&ドロップによるノード配置、マウス操作によるエッジ接続、パン&ズーム機能を提供します。

## Core Architecture

### Component Hierarchy

```
GraphCanvas (メインキャンバス)
├── Node2 (個別ノード) × N
│   └── NodeResult (ノード結果表示)
├── Edge (エッジ接続線) × N
├── Loop (ループ表示)
├── ContextNodeMenu (ノード右クリックメニュー)
└── ContextEdgeMenu (エッジ右クリックメニュー)
```

### State Management

Pinia storeで以下の状態を管理:

```typescript
{
  nodes: GUINodeData[],        // ノードの配列
  edges: GUIEdgeData[],        // エッジの配列
  loop: GUILoopData,           // ループ設定
  histories: HistoryData[],    // Undo/Redo用履歴
  currentData: HistoryPayload, // 現在の状態
  index: number                // 履歴のインデックス
}
```

## Data Types

### Node Types

#### GUINodeData
```typescript
type GUINodeData = {
  type: "computed" | "static";  // ノードタイプ
  nodeId: string;               // ユニークID
  position: NodePositionData;   // 位置情報
  data: ApplicationData;        // アプリケーション固有データ
}
```

#### NodePositionData
```typescript
type NodePositionData = {
  x: number;                    // X座標
  y: number;                    // Y座標
  width?: number;               // 幅（計算後に設定）
  height?: number;              // 高さ（計算後に設定）
  outputCenters?: number[];     // 出力ポート中心のY座標配列
  inputCenters?: number[];      // 入力ポート中心のY座標配列
}
```

#### ApplicationData
```typescript
type ApplicationData = {
  guiAgentId?: string;          // エージェントタイプID
  agentIndex?: number;          // 複数エージェントから選択時のインデックス
  value?: unknown;              // 静的ノードの値
  staticNodeType?: StaticNodeType; // "text" | "data" | "number" | "boolean"
  params?: Record<string, unknown>; // パラメータ
  isResult?: boolean;           // 結果表示フラグ
  nestedGraphIndex?: number;    // ネストグラフのインデックス
}
```

### Edge Types

#### GUIEdgeData
```typescript
type GUIEdgeData = {
  type: "edge";
  source: EdgeEndPointData;     // 接続元
  target: EdgeEndPointData;     // 接続先
}
```

#### EdgeEndPointData
```typescript
type EdgeEndPointData = {
  nodeId: string;               // ノードID
  index: number;                // ポートインデックス（inputs/outputsの配列インデックス）
}
```

### Agent Profile

ノードの入出力定義:

```typescript
type AgentProfile = {
  inputs: InputOutputData[];    // 入力ポート定義
  outputs: InputOutputData[];   // 出力ポート定義
  params?: ParamData[];         // パラメータ定義
  agent?: string;               // エージェントID
  agents?: string[];            // 複数エージェント選択肢
  isNestedGraph?: boolean;      // ネストグラフフラグ
  isMap?: boolean;              // Mapエージェントフラグ
}
```

#### InputOutputData
```typescript
type InputOutputData = {
  name: string;                 // ポート名
  type?: "text" | "array" | "message" | "data" | "wait" | "boolean";
  mapTo?: string;               // マッピング先（特殊用途）
}
```

#### ParamData
```typescript
type ParamData = {
  name: string;
  type?: "string" | "text" | "data" | "boolean" | "float" | "int" | "enum";
  defaultValue?: number | boolean | string;
  max?: number;                 // 数値型の最大値
  min?: number;                 // 数値型の最小値
  step?: number;                // 数値型のステップ
  values?: string[];            // enum型の選択肢
}
```

### Loop Types

```typescript
type GUILoopData = {
  loopType: "while" | "count" | "none";
  while?: string | true;        // while条件式
  count?: number;               // ループ回数
}
```

## Core Components

### GraphCanvas Component

#### Props
なし（内部でstoreを参照）

#### Emits
```typescript
{
  'open-node-editor': (nodeIndex: number) => void
}
```

#### Features
- ノードとエッジの描画
- パン（掴んで移動）とスクロール機能
- エッジ作成時の最近接ノード検出
- コンテキストメニュー表示

#### Template Structure
```vue
<div ref="mainContainer" class="...canvas-container" @click="closeMenu">
  <Loop />
  <svg ref="svgRef">
    <Edge v-for="edge in edgeDataList" ... />
    <Edge v-if="newEdgeData" ... /> <!-- 作成中のエッジ -->
  </svg>
  <Node2 v-for="node in store.nodes" ... />
  <ContextEdgeMenu ref="contextEdgeMenu" />
  <ContextNodeMenu ref="contextNodeMenu" />
</div>
```

### Node2 Component

#### Props
```typescript
{
  nodeData: GUINodeData;        // ノードデータ（必須）
  nearestData?: GUINearestData; // エッジ作成時の最近接情報
  nodeIndex: number;            // ノードのインデックス（必須）
  isConnectable: boolean;       // 接続可能フラグ（デフォルト: true）
}
```

#### Emits
```typescript
{
  'updatePosition': (pos: NodePosition) => void;
  'savePosition': () => void;
  'newEdgeStart': (data: NewEdgeStartEventData) => void;
  'newEdge': (data: Position) => void;
  'newEdgeEnd': () => void;
  'updateStaticNodeValue': (value: UpdateStaticValue) => void;
  'updateNestedGraph': (value: UpdateStaticValue) => void;
  'openNodeMenu': (event: MouseEvent) => void;
  'openNodeEditMenu': (event: MouseEvent) => void;
  'nodeDragStart': () => void;
  'nodeDragEnd': () => void;
}
```

#### Features
- ノードのドラッグ&ドロップ
- 入力/出力ポートの表示
- エッジ接続の開始点・終点
- ダブルクリックでコンテキストメニュー
- シングルクリックでエディタパネルを開く
- 最小移動距離（deltaDistanceThreshold = 4px²）未満の移動は履歴に保存しない

#### Visual Structure
```
┌─────────────────┐
│   nodeId        │ ← ヘッダー（bg-blue-500 or bg-red-500）
│   agentType     │ ← サブヘッダー（computed nodeのみ）
├─────────────────┤
│  output1     ○  │ ← 出力ポート（右側、bg-green-500 or bg-yellow-500）
│  output2     ○  │
├─────────────────┤
│  ○  input1      │ ← 入力ポート（左側、bg-blue-500 or bg-violet-500）
│  ○  input2      │
├─────────────────┤
│  [Result]       │ ← NodeResult（実行結果表示）
└─────────────────┘
```

### Edge Component

#### Props
```typescript
{
  sourceData: EdgeData2;        // 接続元データ（必須）
  targetData: EdgeData2;        // 接続先データ（必須）
  isConnectable: boolean;       // 接続可能フラグ（デフォルト: true）
}
```

#### EdgeData2 Type
```typescript
type EdgeData2 =
  | NewEdgeMouseData    // マウス位置（作成中）
  | NewEdgeNodeData     // ノード接続点

type NewEdgeMouseData = {
  data: { position: NodePositionData };
  index?: number;       // 作成中は未定義
}

type NewEdgeNodeData = {
  nodeId: string;
  index: number;
  data: GUINodeData;
}
```

#### Features
- SVG pathでベジェ曲線を描画
- ホバー時に太さ変更（2px → 4px）とカラー変更
- ダブルクリックでコンテキストメニュー

#### Edge Path Calculation
```typescript
// convEdgePath関数で計算（src/utils/gui/utils.ts）
// sourceのoutputCenters[sourceIndex]からtargetのinputCenters[targetIndex]へ
// ベジェ曲線で接続
```

## User Interactions

### Node Operations

#### 1. ノード追加
```typescript
// AddNode.vueから
store.pushNode({
  nodeId: "custom_id",
  type: "computed" | "static",
  position: { x: number, y: number },
  data: { ... }
})
```

#### 2. ノードドラッグ
1. `mousedown/touchstart` on node → `nodeDragStart`イベント
2. `mousemove/touchmove` → `updatePosition`イベント（履歴には保存しない）
3. `mouseup/touchend` → `nodeDragEnd`イベント
4. 移動距離がthreshold超過なら`savePosition`で履歴保存

#### 3. ノード削除
- ダブルクリック → コンテキストメニュー → Delete
- `store.deleteNode(index)` - 関連エッジも自動削除

### Edge Operations

#### 1. エッジ作成フロー
```
1. 出力ポートでmousedown
   → onNewEdgeStart()
   → newEdgeData = { direction: "outbound", source: NodeData, target: MousePosition }

2. mousemove
   → onNewEdge(mousePosition)
   → newEdgeData.target.position を更新
   → 最近接ノード検出（pickNearestNode）
   → 最近接ポート検出（pickNearestConnect）

3. mouseup
   → onNewEdgeEnd()
   → edgeConnectable検証
   → store.pushEdge() または キャンセル
```

#### 2. エッジ削除
- ダブルクリック → コンテキストメニュー → Delete
- `store.deleteEdge(index)`

### Pan & Scroll

**usePanAndScroll composable** (src/composable/usePanAndScroll.ts)

#### 機能
- マウスドラッグでキャンバスをパン
- ホイールでスクロール
- タッチデバイス対応

#### 無効化条件
- ノードドラッグ中（`isNodeDragging = true`）
- エッジ作成中（`newEdgeData != null`）
- クリック対象がnode/edge/button/input/select/textarea

#### カーソル
- デフォルト: `cursor: grab`
- パン中: `cursor: grabbing`

## Composables

### useNewEdge

エッジ作成ロジックを管理:

```typescript
const {
  svgRef,                       // SVG要素のref
  newEdgeData,                  // 作成中のエッジデータ
  onNewEdgeStart,               // エッジ作成開始
  onNewEdge,                    // マウス移動
  onNewEdgeEnd,                 // エッジ作成終了
  nearestData,                  // 最近接ノード情報
  edgeConnectable               // 接続可否フラグ
} = useNewEdge()
```

#### 最近接検出アルゴリズム
1. `pickNearestNode()` - マウス位置から最も近いノードを検出
2. `pickNearestConnect()` - そのノードの最も近い入力/出力ポートを検出
3. `isEdgeConnectable()` - 接続可能か検証（循環参照チェック等）

### usePanAndScroll

パン&スクロール機能を提供:

```typescript
const { setupPanAndScroll } = usePanAndScroll(
  mainContainer,    // キャンバスのref
  isNodeDragging,   // ノードドラッグ中フラグ
  newEdgeData       // エッジ作成中データ
)
```

## Store API

### Node Operations

```typescript
// ノード追加
store.pushNode(nodeData: GUINodeData): void

// ノード削除（関連エッジも削除）
store.deleteNode(nodeIndex: number): void

// ノード位置更新（履歴なし）
store.updateNodePosition(index: number, pos: NodePosition): void

// ノード位置保存（履歴あり）
store.saveNodePositionData(): void

// ノードパラメータ更新
store.updateNodeParam(index: number, key: string, value: unknown): void

// 静的ノード値更新
store.updateStaticNodeValue(index: number, value: UpdateStaticValue, saveHistory: boolean): void

// ネストグラフ更新
store.updateNestedGraph(index: number, value: UpdateStaticValue): void
```

### Edge Operations

```typescript
// エッジ追加
store.pushEdge(edgeData: GUIEdgeData): void

// エッジ削除
store.deleteEdge(edgeIndex: number): void
```

### History Operations

```typescript
// 元に戻す
store.undo(): void

// やり直し
store.redo(): void

// 元に戻せるか
store.undoable: boolean

// やり直せるか
store.redoable: boolean
```

### Loop Operations

```typescript
// ループ設定更新
store.updateLoop(loopData: GUILoopData): void
```

## Styling System

### Color Scheme

#### Node Colors
- **Computed Node** (type="computed"):
  - Main: `bg-blue-400` (near: `bg-blue-200`)
  - Header: `bg-blue-500` (near: `bg-blue-300`)
  - Output Port: `bg-green-500` (near: `bg-green-200`, invalid: `bg-red-600`)
  - Input Port: `bg-blue-500` (near: `bg-blue-200`, invalid: `bg-red-600`)
  - Input Port (mapTo): `bg-red-400` (near: `bg-red-200`, invalid: `bg-red-700`)

- **Static Node** (type="static"):
  - Main: `bg-red-400` (near: `bg-red-200`)
  - Header: `bg-red-500` (near: `bg-red-300`)
  - Output Port: `bg-yellow-500` (near: `bg-yellow-200`, invalid: `bg-red-600`)
  - Input Port: `bg-violet-500` (near: `bg-violet-200`, invalid: `bg-red-600`)

#### Edge Colors
- Default: `red` (stroke-width: 2)
- Hover: `blue` (stroke-width: 4)
- Not Connectable: `pink`

### Node Dimensions
- Default width: `w-36` (144px)
- Height: 自動計算（内容に応じて）
- Focus時: width × 3, height × 3（入力フォーカス時）

### Z-Index
- Default node: `z-auto`
- Dragging node: 変更なし（DOMの順序で最前面）
- Focused node (input editing): `z-100`

## Event Flow Diagrams

### Node Drag Event Flow
```
User mousedown on node
  ↓
onStartNode()
  - isDragging = true
  - emit('nodeDragStart')
  - offset計算
  ↓
User mousemove
  ↓
onMoveNode()
  - 新しい座標計算
  - emit('updatePosition', newPosition)  ← 履歴なし
  - deltaDistance計算
  ↓
User mouseup
  ↓
onEndNode()
  - isDragging = false
  - emit('nodeDragEnd')
  - if (deltaDistance > 4) emit('savePosition')  ← 履歴あり
```

### Edge Creation Event Flow
```
User mousedown on output port
  ↓
onStartEdge()
  - isNewEdge = true
  - emit('newEdgeStart', { nodeId, x, y, index, direction: "outbound" })
  ↓
onNewEdgeStart() (composable)
  - newEdgeData = { direction: "outbound", source: NodeData, target: MouseData }
  ↓
User mousemove
  ↓
onMoveEdge()
  - emit('newEdge', { x, y })
  ↓
onNewEdge() (composable)
  - newEdgeData.target.position更新
  - pickNearestNode() → nearestNode
  - pickNearestConnect() → nearestConnect
  - nearestData更新
  - isEdgeConnectable() → edgeConnectable
  ↓
User mouseup
  ↓
onEndEdge()
  - isNewEdge = false
  - emit('newEdgeEnd')
  ↓
onNewEdgeEnd() (composable)
  - if (expectEdge && edgeConnectable) store.pushEdge()
  - newEdgeData = null
```

## Utility Functions

### Position & Size Calculation

```typescript
// クライアント座標取得（マウス/タッチ対応）
getClientPos(event: MouseEvent | TouchEvent): { clientX: number, clientY: number }

// ノードサイズ計算
getNodeSize(
  nodeEl: HTMLElement,
  inputEls: HTMLElement[],
  outputEls: HTMLElement[]
): NodePosition

// Transform style生成
getTransformStyle(nodeData: GUINodeData, isDragging: boolean): string
```

### Edge Path Generation

```typescript
// ベジェ曲線パス生成
convEdgePath(
  sourceIndex: number,
  sourcePosition: NodePositionData,
  targetIndex: number,
  targetPosition: NodePositionData
): string  // SVG path d属性
```

### Nearest Detection

```typescript
// 最近接ノード検出
pickNearestNode(
  nodes: GUINodeData[],
  excludeNodeId: string,
  mousePosition: Position
): ClosestNodeData | null

// 最近接ポート検出
pickNearestConnect(
  nearestNode: ClosestNodeData,
  newEdgeData: NewEdgeData,
  mousePosition: Position
): { index: number, distance: number } | undefined

// エッジ接続可否判定
isEdgeConnectable(
  edge: GUIEdgeData | null,
  edges: GUIEdgeData[],
  nodeRecords: GUINodeDataRecord,
  nestedGraphs: NestedGraphList
): boolean
```

## Context Menus

### ContextNodeMenu
- **表示**: ノードをダブルクリック
- **メニュー項目**:
  - Delete: `store.deleteNode(nodeIndex)`

### ContextEdgeMenu
- **表示**: エッジをダブルクリック
- **メニュー項目**:
  - Delete: `store.deleteEdge(edgeIndex)`

## NPM Package Structure (提案)

パッケージ化する際の推奨構成:

```
@grapys/vue-graph-editor/
├── src/
│   ├── components/
│   │   ├── GraphCanvas.vue
│   │   ├── Node.vue
│   │   ├── Edge.vue
│   │   ├── ContextNodeMenu.vue
│   │   └── ContextEdgeMenu.vue
│   ├── composables/
│   │   ├── useNewEdge.ts
│   │   └── usePanAndScroll.ts
│   ├── store/
│   │   └── index.ts
│   ├── types/
│   │   └── index.ts
│   ├── utils/
│   │   ├── position.ts
│   │   ├── edge.ts
│   │   ├── nearest.ts
│   │   └── classUtils.ts
│   └── index.ts (エクスポート)
├── package.json
├── README.md
└── CHANGELOG.md
```

### Export API

```typescript
// Main components
export { GraphCanvas } from './components/GraphCanvas.vue'
export { Node } from './components/Node.vue'
export { Edge } from './components/Edge.vue'

// Store
export { useGraphStore } from './store'

// Composables
export { useNewEdge } from './composables/useNewEdge'
export { usePanAndScroll } from './composables/usePanAndScroll'

// Types
export * from './types'

// Utilities
export * from './utils'
```

### Peer Dependencies

```json
{
  "peerDependencies": {
    "vue": "^3.3.0",
    "pinia": "^2.1.0"
  }
}
```

## 除外する機能（GraphAI固有）

以下の機能はGraphAI依存のため、npm化の際は除外またはオプション化:

- GraphRunner（GraphAIエージェント実行）
- NodeEditorPanel（GraphAI固有のパラメータ編集）
- NodeStaticValue / NodeComputedParams（GraphAI固有）
- NodeResult（GraphAI実行結果表示）
- graphToGUIData / store2graphData（GraphAI GraphData変換）
- agentProfiles（GraphAIエージェント定義）
- ネストグラフ機能（GraphAI固有）

## 抽象化インターフェース（npm化用）

汎用的なグラフエディタとして使用できるよう、以下のインターフェースを定義:

### NodeProfile（AgentProfileの汎用版）

```typescript
interface NodeProfile {
  id: string;                   // ノードタイプID
  name: string;                 // 表示名
  inputs: PortDefinition[];     // 入力ポート定義
  outputs: PortDefinition[];    // 出力ポート定義
  category?: string;            // カテゴリ
  color?: NodeColorScheme;      // カスタムカラー
}

interface PortDefinition {
  name: string;
  type?: string;                // 任意の型文字列
  color?: string;               // ポートカラー
}

interface NodeColorScheme {
  main: string;
  header: string;
  inputPort: string;
  outputPort: string;
}
```

### Callbacks

```typescript
interface GraphEditorCallbacks {
  onNodeAdd?: (node: GUINodeData) => void;
  onNodeUpdate?: (nodeId: string, data: Partial<GUINodeData>) => void;
  onNodeDelete?: (nodeId: string) => void;
  onEdgeAdd?: (edge: GUIEdgeData) => void;
  onEdgeDelete?: (edgeId: string) => void;
  validateEdge?: (source: EdgeEndPointData, target: EdgeEndPointData) => boolean;
}
```

## Performance Considerations

### 最適化手法
1. **ドラッグ中の履歴保存抑制**: `deltaDistanceThreshold`で微小移動を無視
2. **位置更新の遅延**: `updatePosition`は履歴に保存せず、`savePosition`のみ履歴化
3. **Computed Properties**: ノード/エッジリストはcomputedで参照渡し
4. **Event Throttling**: 現状は未実装だが、mousemoveイベントのスロットリング推奨

### レンダリング最適化
- ノード/エッジのkey属性で再利用
- v-forにはstableなkeyを使用（例: `${nodeId}-${index}`）
- 不要な再計算を避けるためcomputedを活用

## Browser Support

- Modern browsers (ES6+)
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

### Input Devices
- マウス操作（drag, click, double-click）
- タッチ操作（touch drag, touch tap）
- ホイールスクロール
