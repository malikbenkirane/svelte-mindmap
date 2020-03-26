import { writable } from 'svelte/store';
import produce from 'immer';

export const store = (() => {
  const initialState = {
    nodes: [],
    connections: [],
    mapToNodes: {},
  };

  const STORE = writable(initialState);

  function dispatch(fn) {
    STORE.update((state) => produce(state, fn));
  }

  const connect = (fn) => (...args) => dispatch(fn(...args));

  const addOrUpdateNode = connect((node) => (state) => {
    const mindmapNode = {
      text: node.title,
      url: node.url,
      markdown: node.notes,
    };
    if (!node.title) return;
    const { mapToNodes, mapNodes } = state;
    if (mapToNodes[node.title]) {
      mapNodes[
        state.nodes.map((n) => n.title).indexOf(node.title)
      ] = mindmapNode;
    } else {
      mapToNodes[node.title] = mindmapNode;
      state.nodes.push(mindmapNode);
    }
    if (node.parent) {
      state.connections.push({
        source: node.parent,
        target: node.title,
      });
    }
    state.needToRender = true;
  });

  const renderDone = connect(() => (state) => {
    state.needToRender = false;
  });

  return {
    subscribe: STORE.subscribe,
    addOrUpdateNode,
    renderDone,
  };
})();
