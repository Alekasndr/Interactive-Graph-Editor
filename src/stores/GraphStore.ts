import { makeAutoObservable } from 'mobx';
import { GraphNode, GraphEdge } from '../types/graph.types';

const STORAGE_KEY = 'graph-editor-data';

const DEFAULT_NODES: GraphNode[] = [
  {
    id: '1',
    type: 'default',
    position: { x: 100, y: 100 },
    data: { label: 'Node 1' },
  },
  {
    id: '2',
    type: 'default',
    position: { x: 400, y: 200 },
    data: { label: 'Node 2' },
  },
];

class GraphStore {
  nodes: GraphNode[] = [];
  edges: GraphEdge[] = [];
  searchQuery: string = '';
  highlightedNodeId: string | null = null;

  constructor() {
    makeAutoObservable(this);
    this.loadFromLocalStorage();
  }

  private saveToLocalStorage() {
    const data = {
      nodes: this.nodes,
      edges: this.edges,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  private loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        this.nodes = data.nodes || [];
        this.edges = data.edges || [];
      } else {
        this.nodes = [...DEFAULT_NODES];
      }
    } catch (error) {
      console.error('Failed to load from localStorage:', error);
      this.nodes = [...DEFAULT_NODES];
    }
  }

  setSearchQuery(query: string) {
    this.searchQuery = query;
    if (query.trim() === '') {
      this.highlightedNodeId = null;
      return;
    }

    const foundNode = this.nodes.find(node =>
      node.data.label.toLowerCase() === query.toLowerCase()
    );

    this.highlightedNodeId = foundNode ? foundNode.id : null;
  }

  private generateNodeId(): string {
    const maxId = this.nodes.reduce((max, node) => {
      const numId = parseInt(node.id);
      return numId > max ? numId : max;
    }, 0);
    return String(maxId + 1);
  }

  private isLabelUnique(label: string): boolean {
    return !this.nodes.some(node => node.data.label === label);
  }

  updateNodes(newNodes: GraphNode[]) {
    this.nodes = newNodes;
    this.saveToLocalStorage();
  }

  updateEdges(newEdges: GraphEdge[]) {
    this.edges = newEdges;
    this.saveToLocalStorage();
  }

  deleteNodes(nodeIds: string[]) {
    this.nodes = this.nodes.filter(node => !nodeIds.includes(node.id));
    this.nodes = [...this.nodes];

    this.edges = this.edges.filter(edge =>
      !nodeIds.includes(edge.source) && !nodeIds.includes(edge.target)
    );
    this.edges = [...this.edges];
    this.saveToLocalStorage();
  }

  deleteEdges(edgeIds: string[]) {
    this.edges = this.edges.filter(edge => !edgeIds.includes(edge.id));
    this.edges = [...this.edges];
    this.saveToLocalStorage();
  }

  addNode(label: string, position: { x: number; y: number }): { success: boolean; error?: string } {
    if (!label.trim()) {
      return { success: false, error: 'Label cannot be empty' };
    }

    if (!this.isLabelUnique(label)) {
      return { success: false, error: `Label "${label}" already exists` };
    }

    const newNode: GraphNode = {
      id: this.generateNodeId(),
      type: 'default',
      position,
      data: { label },
    };

    this.nodes.push(newNode);
    this.saveToLocalStorage();
    return { success: true };
  }

  updateEdgeProperties(edgeId: string, weight?: number) {
    const edge = this.edges.find(e => e.id === edgeId);
    if (edge) {
      edge.data = { weight };
      edge.label = weight !== undefined && weight !== null ? String(weight) : undefined;
      this.edges = [...this.edges];
      this.saveToLocalStorage();
    }
  }

  /**
   * Dijkstra's algorithm for finding shortest path between two nodes
   */
  findShortestPath(startNodeId: string, endNodeId: string): { path: string[]; distance: number } | null {
    const distances: Map<string, number> = new Map();
    const previous: Map<string, string | null> = new Map();
    const unvisited = new Set<string>();

    // Set initial distances
    this.nodes.forEach(node => {
      distances.set(node.id, node.id === startNodeId ? 0 : Infinity);
      previous.set(node.id, null);
      unvisited.add(node.id);
    });

    while (unvisited.size > 0) {
      // Find node with minimum distance
      let currentNode: string | null = null;
      let minDistance = Infinity;

      unvisited.forEach(nodeId => {
        const dist = distances.get(nodeId) ?? Infinity;
        if (dist < minDistance) {
          minDistance = dist;
          currentNode = nodeId;
        }
      });

      // If no reachable node found or reached destination
      if (currentNode === null || minDistance === Infinity) break;
      if (currentNode === endNodeId) break;

      unvisited.delete(currentNode);

      const neighbors = this.edges.filter(
        edge => edge.source === currentNode || edge.target === currentNode
      );

      neighbors.forEach(edge => {
        const neighborId = edge.source === currentNode ? edge.target : edge.source;
        if (!unvisited.has(neighborId)) return;

        const weight = edge.data?.weight ?? 1;
        const altDistance = (distances.get(currentNode!) ?? Infinity) + weight;

        if (altDistance < (distances.get(neighborId) ?? Infinity)) {
          distances.set(neighborId, altDistance);
          previous.set(neighborId, currentNode);
        }
      });
    }

    // Reconstruct path
    const path: string[] = [];
    let current: string | null = endNodeId;

    while (current !== null) {
      path.unshift(current);
      current = previous.get(current) ?? null;
    }

    // Check if path exists
    if (path[0] !== startNodeId) {
      return null;
    }

    return {
      path,
      distance: distances.get(endNodeId) ?? Infinity,
    };
  }
}

export default GraphStore;
