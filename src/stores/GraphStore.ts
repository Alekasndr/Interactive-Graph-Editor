import { makeAutoObservable } from 'mobx';
import { GraphNode, GraphEdge } from '../types/graph.types';

class GraphStore {
  nodes: GraphNode[] = [
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

  edges: GraphEdge[] = [];

  constructor() {
    makeAutoObservable(this);
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
  }

  updateEdges(newEdges: GraphEdge[]) {
    this.edges = newEdges;
  }

  deleteNodes(nodeIds: string[]) {
    this.nodes = this.nodes.filter(node => !nodeIds.includes(node.id));
    this.nodes = [...this.nodes];
  }

  deleteEdges(edgeIds: string[]) {
    this.edges = this.edges.filter(edge => !edgeIds.includes(edge.id));
    this.edges = [...this.edges];
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
    this.nodes = [...this.nodes];
    return { success: true };
  }
}

export default GraphStore;
