'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { getErrorMessage } from '@/lib/errors';
import {
  createClient,
  createProject,
  fetchClients,
  fetchProjects,
  queryKeys,
  updateClient,
  updateProject,
} from '@/lib/queries';
import type {
  CreateClientInput,
  CreateProjectInput,
  UpdateClientInput,
  UpdateProjectInput,
} from '@/types/api';

export function useProjects(filters?: { clientId?: string; includeArchived?: boolean }) {
  return useQuery({
    queryKey: queryKeys.projects(filters),
    queryFn: () => fetchProjects(filters),
  });
}

export function useClients(filters?: { includeInactive?: boolean }) {
  return useQuery({
    queryKey: queryKeys.clients(filters),
    queryFn: () => fetchClients(filters),
  });
}

function useInvalidateProjectsAndClients() {
  const queryClient = useQueryClient();
  return () =>
    Promise.all([
      queryClient.invalidateQueries({ queryKey: ['projects'] }),
      queryClient.invalidateQueries({ queryKey: ['clients'] }),
      queryClient.invalidateQueries({ queryKey: ['reports'] }),
    ]);
}

export function useProjectMutations() {
  const invalidate = useInvalidateProjectsAndClients();

  const createMutation = useMutation({
    mutationFn: (input: CreateProjectInput) => createProject(input),
    onSuccess: () => {
      void invalidate();
      toast.success('Projeto criado.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateProjectInput }) => updateProject(id, input),
    onSuccess: () => {
      void invalidate();
      toast.success('Projeto atualizado.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return { createMutation, updateMutation };
}

export function useClientMutations() {
  const invalidate = useInvalidateProjectsAndClients();

  const createMutation = useMutation({
    mutationFn: (input: CreateClientInput) => createClient(input),
    onSuccess: () => {
      void invalidate();
      toast.success('Cliente criado.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, input }: { id: string; input: UpdateClientInput }) => updateClient(id, input),
    onSuccess: () => {
      void invalidate();
      toast.success('Cliente atualizado.');
    },
    onError: (error) => toast.error(getErrorMessage(error)),
  });

  return { createMutation, updateMutation };
}
