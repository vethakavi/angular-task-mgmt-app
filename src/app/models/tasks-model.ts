export interface Tasks {
  _id: string;
  title: string;
  status: 'todo' | 'inprogress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateTask {
  title: string;
  status: 'todo' | 'inprogress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}
