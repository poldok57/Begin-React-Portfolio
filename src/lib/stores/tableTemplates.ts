import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TableColors, TableSettings, TableType } from "@/components/room/types";
import { createLocalStoragePersist } from "./persist";
import { generateUniqueId } from "../utils/unique-id";

// Structure d'un template de table
export interface TableTemplate {
  id: string;
  name: string;
  type: TableType;
  colors: TableColors;
  settings?: TableSettings | null;
}

// Interface du store
interface TableTemplateState {
  templates: TableTemplate[];
  addTemplate: (template: Omit<TableTemplate, "id">) => string;
  updateTemplate: (id: string, template: Partial<TableTemplate>) => void;
  deleteTemplate: (id: string) => void;
  getTemplate: (id: string) => TableTemplate | undefined;
  getAllTemplates: () => TableTemplate[];
}

// Création du store
export const useTableTemplateStore = create<TableTemplateState>()(
  persist(
    (set, get) => ({
      templates: [],

      // Ajouter un nouveau template
      addTemplate: (template) => {
        const id = generateUniqueId("tmpl");
        const newTemplate = { ...template, id };

        set((state) => ({
          templates: [...state.templates, newTemplate],
        }));

        return id;
      },

      // Mettre à jour un template existant
      updateTemplate: (id, template) => {
        set((state) => ({
          templates: state.templates.map((t) =>
            t.id === id ? { ...t, ...template } : t
          ),
        }));
      },

      // Supprimer un template
      deleteTemplate: (id) => {
        set((state) => ({
          templates: state.templates.filter((t) => t.id !== id),
        }));
      },

      // Récupérer un template par son ID
      getTemplate: (id) => {
        return get().templates.find((t) => t.id === id);
      },

      // Récupérer tous les templates
      getAllTemplates: () => {
        return get().templates;
      },
    }),
    {
      name: "table-templates-storage",
      storage: createLocalStoragePersist<TableTemplateState>(),
    }
  )
);
