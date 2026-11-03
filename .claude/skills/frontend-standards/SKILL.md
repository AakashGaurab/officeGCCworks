---
name: frontend-standards
description: Frontend coding, naming, component-structure and PR standards, plus SOLID and KISS principles. Use when writing, reviewing or opening a PR for any frontend (React/JSX) code.
---

# Frontend Standards

Apply SOLID and KISS to all code. Where a rule below conflicts with cleverness, choose the simpler option.

## 1. Design principles

### KISS
- Prefer the simplest solution that meets the spec. No speculative features, options or abstractions.
- Small functions that do one thing; shallow nesting; early returns over deep `if/else`.
- Plain, readable code over clever one-liners. Don't add a library or pattern when a few lines of code do the job.

### SOLID (applied to React)
- **S - Single Responsibility**: one component, hook or function has one reason to change. Split data fetching/business logic (hooks, utils) from presentation (components). Split big components into small ones.
- **O - Open/Closed**: extend behavior through props, composition, `children` or config objects, not by editing a component with more `if (type === ...)` branches.
- **L - Liskov Substitution**: a component that wraps or replaces another (e.g. a custom `Button` over a base button) must honor the same props contract and not break callers.
- **I - Interface Segregation**: pass only the props a component needs. No giant prop objects; don't force components to accept props they ignore.
- **D - Dependency Inversion**: components depend on abstractions (props, callbacks, hooks, service modules), not on concrete API clients or globals imported deep inside. Inject them so they can be swapped and tested.

## 2. Naming

| Thing | Convention | Example |
|---|---|---|
| Components | PascalCase | `UserTable` |
| Files | PascalCase | `UserTable.jsx` |
| Functions, variables | camelCase | `userList` |
| CSS class names | kebab-case | `user-table-header` |
| Enums, constants | SCREAMING_SNAKE_CASE | `MAX_PAGE_SIZE` |
| useState | `[testValue, setTestValue]` | `const [testValue, setTestValue] = useState(0)` |
| useRef | `testRef` | `const tableRef = useRef(null)` |
| Event handlers | `handle` + target + action | `handleSubmitClick` |
| Render functions | `render` + what | `renderTestTable` |

## 3. Code rules

- **No magic numbers** in components. Put them in a constants file (a per-component constants file if specific to it, otherwise the common constants file). Create the file if it doesn't exist.
- **All strings live in an enum** and are used from there (labels, messages, keys, statuses).
- **Move as much logic as possible outside the component** (utils, helpers, custom hooks).
- **Arrays and objects are declared outside the component** to avoid re-creation and re-renders.
- **No inline functions** in JSX.

```jsx
// Wrong
<Button onClick={() => setVal(1)}>Click</Button>

// Correct
const handleButtonClick = () => setVal(1);
<Button onClick={handleButtonClick}>Click</Button>
```

## 4. Component structure (in this order)

1. Imports
2. Enums, constants
3. Component
   1. Common hooks
   2. `useState`
   3. `useRef`
   4. `useEffect`
   5. Event handler functions (`handleXxxYyy`)
   6. Render functions (`renderXxx`)
   7. Other functions
   8. Return

```jsx
import { useState } from 'react';

const BUTTON_LABEL = { CLICK: 'Click' }; // enum
const INITIAL_COUNT = 0;                 // constant

const CounterButton = () => {
  const [count, setCount] = useState(INITIAL_COUNT);

  const handleCounterClick = () => setCount((prev) => prev + 1);

  return <button onClick={handleCounterClick}>{BUTTON_LABEL.CLICK} {count}</button>;
};

export default CounterButton;
```

## 5. Git and PR rules

- Every PR title starts with the Jira ticket ID, e.g. `PROJ-123 Add CSV export`.
- Merging into `main` is always **squash and merge**. For sandbox and prod, use either merge or rebase and merge.
- PR comments are resolved by the reviewer, not the author.
- Branch naming: `feature/...` for new features, `fix/...` for fixes.

## 6. Reviewer checklist

Flag any of: magic numbers, hard-coded strings outside an enum, inline functions in JSX, arrays/objects defined inside the component, logic that could live outside the component, wrong naming case, wrong component section order, a component or function with more than one responsibility, needless complexity (KISS), and a PR title missing the Jira ID.
