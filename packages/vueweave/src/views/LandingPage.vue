<template>
  <div class="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50">
    <!-- Hero Section -->
    <section class="relative overflow-hidden px-6 py-20">
      <div class="mx-auto max-w-7xl">
        <div class="text-center">
          <h1 class="mb-6 text-6xl font-bold text-gray-900">
            VueWeave
            <span class="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Flow Editor</span>
          </h1>
          <p class="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            A modern, flexible node-based flow editor for Vue 3. Build visual workflows, AI pipelines, and interactive diagrams with ease.
          </p>
          <div class="flex flex-wrap justify-center gap-4">
            <router-link
              to="/interactive"
              class="rounded-lg bg-indigo-600 px-8 py-3 text-lg font-semibold text-white shadow-lg transition hover:bg-indigo-700"
            >
              Try Interactive Demo
            </router-link>
            <a
              href="#examples"
              class="rounded-lg border-2 border-indigo-600 px-8 py-3 text-lg font-semibold text-indigo-600 transition hover:bg-indigo-50"
            >
              View Examples
            </a>
            <a
              href="#documentation"
              class="rounded-lg border-2 border-gray-400 px-8 py-3 text-lg font-semibold text-gray-700 transition hover:bg-gray-50"
            >
              Documentation
            </a>
          </div>
        </div>

        <!-- Quick Stats -->
        <div class="mt-16 grid grid-cols-1 gap-8 md:grid-cols-3">
          <div class="rounded-xl bg-white p-6 shadow-lg">
            <div class="text-3xl font-bold text-indigo-600">Vue 3</div>
            <div class="mt-2 text-gray-600">Built with modern Vue 3 Composition API</div>
          </div>
          <div class="rounded-xl bg-white p-6 shadow-lg">
            <div class="text-3xl font-bold text-purple-600">TypeScript</div>
            <div class="mt-2 text-gray-600">Full type safety and IntelliSense support</div>
          </div>
          <div class="rounded-xl bg-white p-6 shadow-lg">
            <div class="text-3xl font-bold text-pink-600">Tailwind CSS</div>
            <div class="mt-2 text-gray-600">Customizable with familiar utility classes</div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section id="features" class="bg-white px-6 py-20">
      <div class="mx-auto max-w-7xl">
        <h2 class="mb-12 text-center text-4xl font-bold text-gray-900">Why VueWeave?</h2>

        <div class="grid grid-cols-1 gap-12 md:grid-cols-2">
          <!-- Feature 1 -->
          <div class="flex gap-4">
            <div class="flex-shrink-0">
              <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-100 text-2xl">🎨</div>
            </div>
            <div>
              <h3 class="mb-2 text-xl font-bold text-gray-900">Highly Customizable Nodes</h3>
              <p class="text-gray-600">
                Customize nodes with Vue templates. Style by node type or individual nodeId. Use Tailwind classes or custom CSS for complete
                control.
              </p>
            </div>
          </div>

          <!-- Feature 2 -->
          <div class="flex gap-4">
            <div class="flex-shrink-0">
              <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-purple-100 text-2xl">🔗</div>
            </div>
            <div>
              <h3 class="mb-2 text-xl font-bold text-gray-900">Flexible Edge Connections</h3>
              <p class="text-gray-600">
                Define custom ports per node. Implement validation rules for exclusive connections, type-specific linking, and more.
              </p>
            </div>
          </div>

          <!-- Feature 3 -->
          <div class="flex gap-4">
            <div class="flex-shrink-0">
              <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-pink-100 text-2xl">💾</div>
            </div>
            <div>
              <h3 class="mb-2 text-xl font-bold text-gray-900">State Management with Pinia</h3>
              <p class="text-gray-600">
                Built-in Pinia store manages nodes and edges. Supports load/save, with full undo/redo history tracking.
              </p>
            </div>
          </div>

          <!-- Feature 4 -->
          <div class="flex gap-4">
            <div class="flex-shrink-0">
              <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-green-100 text-2xl">⚡</div>
            </div>
            <div>
              <h3 class="mb-2 text-xl font-bold text-gray-900">Zero Configuration</h3>
              <p class="text-gray-600">
                Works out of the box with sensible defaults. Add <code class="rounded bg-gray-100 px-1">&lt;GraphCanvasBase /&gt;</code> and
                you're ready to go.
              </p>
            </div>
          </div>

          <!-- Feature 5 -->
          <div class="flex gap-4">
            <div class="flex-shrink-0">
              <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-100 text-2xl">🎯</div>
            </div>
            <div>
              <h3 class="mb-2 text-xl font-bold text-gray-900">Production Ready</h3>
              <p class="text-gray-600">
                Powers Grapys and GraphAI - real-world AI workflow and automation tools used in production environments.
              </p>
            </div>
          </div>

          <!-- Feature 6 -->
          <div class="flex gap-4">
            <div class="flex-shrink-0">
              <div class="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-100 text-2xl">📱</div>
            </div>
            <div>
              <h3 class="mb-2 text-xl font-bold text-gray-900">Touch & Pan Support</h3>
              <p class="text-gray-600">Works on desktop and mobile. Pan, zoom, and connect nodes with mouse or touch gestures.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Comparison Section -->
    <section id="comparison" class="px-6 py-20">
      <div class="mx-auto max-w-7xl">
        <h2 class="mb-12 text-center text-4xl font-bold text-gray-900">How VueWeave Compares</h2>

        <div class="overflow-x-auto">
          <table class="w-full rounded-lg bg-white shadow-lg">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-4 text-left text-sm font-semibold text-gray-900">Feature</th>
                <th class="px-6 py-4 text-center text-sm font-semibold text-indigo-600">VueWeave</th>
                <th class="px-6 py-4 text-center text-sm font-semibold text-gray-600">React Flow</th>
                <th class="px-6 py-4 text-center text-sm font-semibold text-gray-600">LiteGraph</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-200">
              <tr>
                <td class="px-6 py-4 text-sm text-gray-900">Framework</td>
                <td class="px-6 py-4 text-center text-sm font-semibold text-indigo-600">Vue 3</td>
                <td class="px-6 py-4 text-center text-sm text-gray-600">React</td>
                <td class="px-6 py-4 text-center text-sm text-gray-600">Vanilla JS</td>
              </tr>
              <tr class="bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-900">TypeScript Support</td>
                <td class="px-6 py-4 text-center">✅</td>
                <td class="px-6 py-4 text-center">✅</td>
                <td class="px-6 py-4 text-center">❌</td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-sm text-gray-900">Template-based Customization</td>
                <td class="px-6 py-4 text-center">✅</td>
                <td class="px-6 py-4 text-center">⚠️ (JSX)</td>
                <td class="px-6 py-4 text-center">❌</td>
              </tr>
              <tr class="bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-900">Built-in Undo/Redo</td>
                <td class="px-6 py-4 text-center">✅</td>
                <td class="px-6 py-4 text-center">❌</td>
                <td class="px-6 py-4 text-center">⚠️ (Limited)</td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-sm text-gray-900">Per-port Connection Rules</td>
                <td class="px-6 py-4 text-center">✅</td>
                <td class="px-6 py-4 text-center">⚠️ (Global)</td>
                <td class="px-6 py-4 text-center">✅</td>
              </tr>
              <tr class="bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-900">Tailwind CSS Integration</td>
                <td class="px-6 py-4 text-center">✅</td>
                <td class="px-6 py-4 text-center">⚠️</td>
                <td class="px-6 py-4 text-center">❌</td>
              </tr>
              <tr>
                <td class="px-6 py-4 text-sm text-gray-900">Zero Config Setup</td>
                <td class="px-6 py-4 text-center">✅</td>
                <td class="px-6 py-4 text-center">❌</td>
                <td class="px-6 py-4 text-center">⚠️</td>
              </tr>
              <tr class="bg-gray-50">
                <td class="px-6 py-4 text-sm text-gray-900">Bundle Size</td>
                <td class="px-6 py-4 text-center text-sm font-semibold text-green-600">~50KB</td>
                <td class="px-6 py-4 text-center text-sm text-gray-600">~100KB</td>
                <td class="px-6 py-4 text-center text-sm text-gray-600">~80KB</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </section>

    <!-- Examples Section -->
    <section id="examples" class="bg-white px-6 py-20">
      <div class="mx-auto max-w-7xl">
        <h2 class="mb-12 text-center text-4xl font-bold text-gray-900">Explore Examples</h2>

        <div class="mb-8 text-center">
          <p class="text-lg text-gray-600">Live interactive demos showcasing VueWeave's capabilities</p>
        </div>

        <div class="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          <!-- Example 1: Minimal -->
          <router-link to="/minimal" class="group block rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 p-6 shadow-lg transition hover:shadow-xl">
            <div class="mb-4 text-4xl">✨</div>
            <h3 class="mb-2 text-xl font-bold text-gray-900 group-hover:text-slate-600">Minimal Example</h3>
            <p class="mb-4 text-gray-600">The simplest possible setup. Just a few lines of code to get started with VueWeave.</p>
            <div class="font-semibold text-slate-600">View demo →</div>
          </router-link>

          <!-- Example 2: Simple -->
          <router-link to="/simple" class="group block rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 p-6 shadow-lg transition hover:shadow-xl">
            <div class="mb-4 text-4xl">🌱</div>
            <h3 class="mb-2 text-xl font-bold text-gray-900 group-hover:text-emerald-600">Simple Example</h3>
            <p class="mb-4 text-gray-600">Basic graph with custom node rendering and simple connections.</p>
            <div class="font-semibold text-emerald-600">View demo →</div>
          </router-link>

          <!-- Example 3: Interactive -->
          <router-link to="/interactive" class="group block rounded-xl bg-gradient-to-br from-purple-50 to-indigo-50 p-6 shadow-lg transition hover:shadow-xl">
            <div class="mb-4 text-4xl">🎮</div>
            <h3 class="mb-2 text-xl font-bold text-gray-900 group-hover:text-indigo-600">Interactive Demo</h3>
            <p class="mb-4 text-gray-600">
              Add nodes dynamically, connect them, and see undo/redo in action. Full CRUD operations with editable node parameters.
            </p>
            <div class="font-semibold text-indigo-600">Try it now →</div>
          </router-link>

          <!-- Example 4: Validation -->
          <router-link to="/validation" class="group block rounded-xl bg-gradient-to-br from-pink-50 to-rose-50 p-6 shadow-lg transition hover:shadow-xl">
            <div class="mb-4 text-4xl">✅</div>
            <h3 class="mb-2 text-xl font-bold text-gray-900 group-hover:text-pink-600">Connection Validation</h3>
            <p class="mb-4 text-gray-600">
              Custom validation rules: exclusive connections, type matching, and per-port restrictions with visual feedback.
            </p>
            <div class="font-semibold text-pink-600">View demo →</div>
          </router-link>

          <!-- Example 5: Styled -->
          <router-link to="/styled" class="group block rounded-xl bg-gradient-to-br from-blue-50 to-cyan-50 p-6 shadow-lg transition hover:shadow-xl">
            <div class="mb-4 text-4xl">🎨</div>
            <h3 class="mb-2 text-xl font-bold text-gray-900 group-hover:text-blue-600">Custom Styling</h3>
            <p class="mb-4 text-gray-600">Different node types with custom colors, gradients, and dynamic edge coloring based on g data flow.</p>
            <div class="font-semibold text-blue-600">View demo →</div>
          </router-link>

          <!-- Example 6: GraphAI -->
          <a
            href="https://github.com/receptron/graphai"
            target="_blank"
            class="group block rounded-xl bg-gradient-to-br from-green-50 to-emerald-50 p-6 shadow-lg transition hover:shadow-xl"
          >
            <div class="mb-4 text-4xl">🤖</div>
            <h3 class="mb-2 text-xl font-bold text-gray-900 group-hover:text-green-600">GraphAI</h3>
            <p class="mb-4 text-gray-600">Production AI workflow system built with VueWeave. Execute complex AI pipelines visually.</p>
            <div class="font-semibold text-green-600">Visit project →</div>
          </a>

          <!-- Example 7: Grapys -->
          <a
            href="https://github.com/receptron/grapys"
            target="_blank"
            class="group block rounded-xl bg-gradient-to-br from-yellow-50 to-orange-50 p-6 shadow-lg transition hover:shadow-xl"
          >
            <div class="mb-4 text-4xl">⚙️</div>
            <h3 class="mb-2 text-xl font-bold text-gray-900 group-hover:text-yellow-600">Grapys</h3>
            <p class="mb-4 text-gray-600">Automation and workflow tool powered by VueWeave. Build complex data processing pipelines.</p>
            <div class="font-semibold text-yellow-600">Visit project →</div>
          </a>

          <!-- Example 8: Documentation -->
          <a
            href="https://github.com/receptron/grapys/tree/main/packages/vueweave"
            target="_blank"
            class="group block rounded-xl bg-gradient-to-br from-indigo-50 to-purple-50 p-6 shadow-lg transition hover:shadow-xl"
          >
            <div class="mb-4 text-4xl">📚</div>
            <h3 class="mb-2 text-xl font-bold text-gray-900 group-hover:text-indigo-600">Full Documentation</h3>
            <p class="mb-4 text-gray-600">Complete API reference, guides, and examples in the GitHub repository.</p>
            <div class="font-semibold text-indigo-600">Read docs →</div>
          </a>
        </div>
      </div>
    </section>

    <!-- Quick Start Section -->
    <section id="quickstart" class="px-6 py-20">
      <div class="mx-auto max-w-4xl">
        <h2 class="mb-12 text-center text-4xl font-bold text-gray-900">Quick Start</h2>

        <div class="space-y-8">
          <!-- Step 1 -->
          <div class="rounded-xl bg-white p-8 shadow-lg">
            <div class="mb-4 flex items-center gap-4">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white">1</div>
              <h3 class="text-2xl font-bold text-gray-900">Install</h3>
            </div>
            <div class="code-highlight rounded-lg bg-gray-900 p-4 text-sm">
              <pre class="text-gray-100"><code><span class="token-function">npm</span> install vueweave
<span class="token-comment"># or</span>
<span class="token-function">yarn</span> add vueweave</code></pre>
            </div>
          </div>

          <!-- Step 2 -->
          <div class="rounded-xl bg-white p-8 shadow-lg">
            <div class="mb-4 flex items-center gap-4">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white">2</div>
              <h3 class="text-2xl font-bold text-gray-900">Import Styles</h3>
            </div>
            <div class="code-highlight rounded-lg bg-gray-900 p-4 text-sm">
              <pre class="text-gray-100"><code><span class="token-comment">// main.ts</span>
<span class="token-keyword">import</span> <span class="token-string">"vueweave/style.css"</span>;</code></pre>
            </div>
          </div>

          <!-- Step 3 -->
          <div class="rounded-xl bg-white p-8 shadow-lg">
            <div class="mb-4 flex items-center gap-4">
              <div class="flex h-10 w-10 items-center justify-center rounded-full bg-indigo-600 text-xl font-bold text-white">3</div>
              <h3 class="text-2xl font-bold text-gray-900">Use in Your Component</h3>
            </div>
            <div class="code-highlight rounded-lg bg-gray-900 p-4 text-sm">
              <pre class="text-gray-100"><code><span class="token-tag">&lt;template&gt;</span>
  <span class="token-tag">&lt;GraphCanvasBase</span> <span class="token-tag">/&gt;</span>
<span class="token-tag">&lt;/template&gt;</span>

<span class="token-tag">&lt;script setup&gt;</span>
<span class="token-keyword">import</span> { onMounted } <span class="token-keyword">from</span> <span class="token-string">"vue"</span>;
<span class="token-keyword">import</span> { useFlowStore, GraphCanvasBase } <span class="token-keyword">from</span> <span class="token-string">"vueweave"</span>;

<span class="token-keyword">const</span> <span class="token-variable">flowStore</span> = <span class="token-function">useFlowStore</span>();

<span class="token-function">onMounted</span>(() => {
  flowStore.<span class="token-function">initData</span>(
    [
      { <span class="token-property">type</span>: <span class="token-string">"node"</span>, <span class="token-property">nodeId</span>: <span class="token-string">"A"</span>, <span class="token-property">position</span>: { <span class="token-property">x</span>: <span class="token-number">100</span>, <span class="token-property">y</span>: <span class="token-number">100</span> }, <span class="token-property">data</span>: {} },
      { <span class="token-property">type</span>: <span class="token-string">"node"</span>, <span class="token-property">nodeId</span>: <span class="token-string">"B"</span>, <span class="token-property">position</span>: { <span class="token-property">x</span>: <span class="token-number">400</span>, <span class="token-property">y</span>: <span class="token-number">100</span> }, <span class="token-property">data</span>: {} },
    ],
    [
      { <span class="token-property">type</span>: <span class="token-string">"edge"</span>, <span class="token-property">source</span>: { <span class="token-property">nodeId</span>: <span class="token-string">"A"</span>, <span class="token-property">index</span>: <span class="token-number">0</span> }, <span class="token-property">target</span>: { <span class="token-property">nodeId</span>: <span class="token-string">"B"</span>, <span class="token-property">index</span>: <span class="token-number">0</span> } },
    ],
    {}
  );
});
<span class="token-tag">&lt;/script&gt;</span></code></pre>
            </div>
          </div>
        </div>

        <div class="mt-12 text-center">
          <p class="mb-4 text-gray-600">That's it! You now have a working flow editor.</p>
          <a
            href="https://github.com/receptron/graphai/tree/main/packages/vueweave"
            target="_blank"
            class="inline-block rounded-lg bg-indigo-600 px-8 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            View Full Documentation
          </a>
        </div>
      </div>
    </section>

    <!-- API Reference Section -->
    <section id="documentation" class="bg-white px-6 py-20">
      <div class="mx-auto max-w-7xl">
        <h2 class="mb-12 text-center text-4xl font-bold text-gray-900">API Reference</h2>

        <div class="mb-12 text-center">
          <p class="mb-4 text-lg text-gray-600">Quick reference for the most commonly used APIs</p>
          <a
            href="https://github.com/receptron/grapys/tree/main/packages/vueweave#readme"
            target="_blank"
            class="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white transition hover:bg-indigo-700"
          >
            <span>View Full Documentation on GitHub</span>
            <span>→</span>
          </a>
        </div>

        <div class="grid grid-cols-1 gap-8 lg:grid-cols-2">
          <!-- GraphCanvasBase Component -->
          <div class="rounded-xl bg-gray-50 p-6 shadow-lg">
            <h3 class="mb-4 text-2xl font-bold text-gray-900">GraphCanvasBase</h3>
            <p class="mb-4 text-gray-600">Main canvas component for rendering the flow graph.</p>

            <div class="space-y-3">
              <div>
                <h4 class="mb-2 font-semibold text-gray-900">Props (all optional)</h4>
                <div class="space-y-2 text-sm">
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">nodes</code>
                    <span class="text-gray-600">: GUINodeData[]</span>
                    <p class="mt-1 text-gray-500">Array of node data</p>
                  </div>
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">edges</code>
                    <span class="text-gray-600">: GUIEdgeData[]</span>
                    <p class="mt-1 text-gray-500">Array of edge connections</p>
                  </div>
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">nodeStyles</code>
                    <span class="text-gray-600">: NodeStyleOptions</span>
                    <p class="mt-1 text-gray-500">Styling configuration for nodes and edges</p>
                  </div>
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">validateConnection</code>
                    <span class="text-gray-600">: ValidateConnectionFn</span>
                    <p class="mt-1 text-gray-500">Custom validation for edge connections</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="mb-2 font-semibold text-gray-900">Slots</h4>
                <div class="space-y-2 text-sm">
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">#node</code>
                    <p class="mt-1 text-gray-500">Custom node template (receives nodeData, nodeIndex)</p>
                  </div>
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">#head</code>
                    <p class="mt-1 text-gray-500">Content above the canvas</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- NodeBase Component -->
          <div class="rounded-xl bg-gray-50 p-6 shadow-lg">
            <h3 class="mb-4 text-2xl font-bold text-gray-900">NodeBase</h3>
            <p class="mb-4 text-gray-600">Base component for rendering individual nodes.</p>

            <div class="space-y-3">
              <div>
                <h4 class="mb-2 font-semibold text-gray-900">Props</h4>
                <div class="space-y-2 text-sm">
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">inputs</code>
                    <span class="text-gray-600">: InputOutputData[]</span>
                    <p class="mt-1 text-gray-500">Array of input ports</p>
                  </div>
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">outputs</code>
                    <span class="text-gray-600">: InputOutputData[]</span>
                    <p class="mt-1 text-gray-500">Array of output ports</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="mb-2 font-semibold text-gray-900">Slots</h4>
                <div class="space-y-2 text-sm">
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">#header</code>
                    <p class="mt-1 text-gray-500">Node header content</p>
                  </div>
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">#body-head</code>
                    <p class="mt-1 text-gray-500">Top of node body</p>
                  </div>
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">#body-main</code>
                    <p class="mt-1 text-gray-500">Main node body content</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- useFlowStore -->
          <div class="rounded-xl bg-gray-50 p-6 shadow-lg">
            <h3 class="mb-4 text-2xl font-bold text-gray-900">useFlowStore()</h3>
            <p class="mb-4 text-gray-600">Pinia store for managing graph state.</p>

            <div class="space-y-3">
              <div>
                <h4 class="mb-2 font-semibold text-gray-900">State</h4>
                <div class="space-y-2 text-sm">
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">nodes</code>
                    <span class="text-gray-600">: GUINodeData[]</span>
                  </div>
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">edges</code>
                    <span class="text-gray-600">: GUIEdgeData[]</span>
                  </div>
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">undoable</code> / <code class="text-indigo-600">redoable</code>
                    <span class="text-gray-600">: boolean</span>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="mb-2 font-semibold text-gray-900">Methods</h4>
                <div class="space-y-2 text-sm">
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">initData(nodes, edges, extra)</code>
                    <p class="mt-1 text-gray-500">Initialize graph data</p>
                  </div>
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">pushNode(node)</code> / <code class="text-indigo-600">deleteNode(index)</code>
                    <p class="mt-1 text-gray-500">Add or remove nodes</p>
                  </div>
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">pushEdge(edge)</code> / <code class="text-indigo-600">deleteEdge(index)</code>
                    <p class="mt-1 text-gray-500">Add or remove edges</p>
                  </div>
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">undo()</code> / <code class="text-indigo-600">redo()</code>
                    <p class="mt-1 text-gray-500">Undo/redo operations</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Node Styling -->
          <div class="rounded-xl bg-gray-50 p-6 shadow-lg">
            <h3 class="mb-4 text-2xl font-bold text-gray-900">Node Styling</h3>
            <p class="mb-4 text-gray-600">Customize node and edge appearance.</p>

            <div class="space-y-3">
              <div>
                <h4 class="mb-2 font-semibold text-gray-900">NodeStyleOptions</h4>
                <div class="space-y-2 text-sm">
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">colors</code>
                    <span class="text-gray-600">: NodeColorConfig</span>
                    <p class="mt-1 text-gray-500">Map node types to Tailwind classes</p>
                  </div>
                  <div class="rounded bg-white p-3">
                    <code class="text-indigo-600">edgeColors</code>
                    <span class="text-gray-600">: EdgeColorConfig</span>
                    <p class="mt-1 text-gray-500">Configure edge colors (default + custom function)</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 class="mb-2 font-semibold text-gray-900">Example</h4>
                <div class="code-highlight rounded-lg bg-gray-900 p-3 text-xs">
                  <pre class="text-gray-100"><code><span class="token-keyword">const</span> <span class="token-variable">nodeStyles</span> = {
  <span class="token-property">colors</span>: {
    <span class="token-property">processor</span>: {
      <span class="token-property">main</span>: <span class="token-string">"bg-blue-400"</span>,
      <span class="token-property">header</span>: <span class="token-string">"bg-blue-500"</span>
    }
  },
  <span class="token-property">edgeColors</span>: {
    <span class="token-property">edge</span>: <span class="token-string">"#6366f1"</span>,
    <span class="token-property">customColor</span>: <span class="token-function">(context)</span> => ({ ... })
  }
};</code></pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-12 text-center">
          <a
            href="https://github.com/receptron/grapys/tree/main/packages/vueweave#readme"
            target="_blank"
            class="inline-flex items-center gap-2 text-lg font-semibold text-indigo-600 hover:text-indigo-800"
          >
            <span>View complete API documentation →</span>
          </a>
        </div>
      </div>
    </section>

    <!-- Footer -->
    <footer class="bg-gray-900 px-6 py-12 text-white">
      <div class="mx-auto max-w-7xl">
        <div class="grid grid-cols-1 gap-8 md:grid-cols-3">
          <div>
            <h3 class="mb-4 text-xl font-bold">VueWeave</h3>
            <p class="text-gray-400">A modern flow editor for Vue 3 applications.</p>
          </div>
          <div>
            <h3 class="mb-4 text-xl font-bold">Links</h3>
            <ul class="space-y-2 text-gray-400">
              <li>
                <a href="https://github.com/receptron/grapys/tree/main/packages/vueweave" target="_blank" class="hover:text-white">GitHub</a>
              </li>
              <li>
                <a href="https://www.npmjs.com/package/vueweave" target="_blank" class="hover:text-white">npm Package</a>
              </li>
              <li>
                <a href="https://github.com/receptron/graphai" target="_blank" class="hover:text-white">GraphAI</a>
              </li>
            </ul>
          </div>
          <div>
            <h3 class="mb-4 text-xl font-bold">Community</h3>
            <ul class="space-y-2 text-gray-400">
              <li>
                <a href="https://github.com/receptron/graphai/issues" target="_blank" class="hover:text-white">Report Issues</a>
              </li>
              <li>
                <a href="https://github.com/receptron/graphai/discussions" target="_blank" class="hover:text-white">Discussions</a>
              </li>
            </ul>
          </div>
        </div>
        <div class="mt-8 border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>&copy; 2025 VueWeave. MIT License.</p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
// Landing page component - no additional imports needed
</script>

<style scoped>
/* Code highlighting styles */
.code-highlight .token-tag {
  color: #7dd3fc; /* sky-300 */
}

.code-highlight .token-keyword {
  color: #c084fc; /* purple-400 */
}

.code-highlight .token-string {
  color: #86efac; /* green-300 */
}

.code-highlight .token-variable {
  color: #fbbf24; /* amber-400 */
}

.code-highlight .token-function {
  color: #60a5fa; /* blue-400 */
}

.code-highlight .token-property {
  color: #fca5a5; /* red-300 */
}

.code-highlight .token-number {
  color: #fdba74; /* orange-300 */
}

.code-highlight .token-comment {
  color: #9ca3af; /* gray-400 */
  font-style: italic;
}

.code-highlight pre {
  margin: 0;
  overflow-x: auto;
}

.code-highlight code {
  font-family: "Fira Code", "Consolas", "Monaco", monospace;
  line-height: 1.6;
}
</style>
