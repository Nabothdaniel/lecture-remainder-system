export interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: Date;
}

export interface Project {
  id: string;
  title: string;
  messages: ChatMessage[];
}

export interface SidebarStore {
  projects: Project[];
  activeProjectId: string | null;
  addProject: () => Project;
  addMessage:  (projectId: string, message: ChatMessage) => void
  hasInitialized: boolean;
  renameProject: (id: string, title: string) => void;
  setActiveProject: (id: string) => void;
}