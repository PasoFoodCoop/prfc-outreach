"use client";

import { useCallback, useState, useTransition } from "react";
import { toast } from "sonner";

import { EntityCard } from "@/components/groups/entity-card";
import { GroupDetailViewModal } from "@/components/groups/group-detail-view-modal";
import { GroupEditModal } from "@/components/groups/group-edit-modal";
import { CreateGroupModal } from "@/components/groups/create-group-modal";
import { DeleteGroupModal } from "@/components/groups/delete-group-modal";
import { AddMembersModal } from "@/components/groups/add-members-modal";
import type { MemberRow } from "@/components/groups/add-members-modal";
import { useSetTopBarAction } from "@/components/layout/top-bar-action-context";
import {
  fetchEnrichedGroup,
  createContactGroup,
  updateContactGroup,
  deleteContactGroup,
  addMembers,
} from "@/actions/contact-group";
import type { EnrichedGroupData } from "@/actions/contact-group";
import type { GroupWithCount } from "@/services/contact-group";

const EMPTY_GROUP: EnrichedGroupData = {
  id: 0,
  name: "",
  description: null,
  members: [],
  memberCount: 0,
};

function buildGroupFormData(data: { name: string; description: string | null }): FormData {
  const formData = new FormData();
  formData.set("name", data.name);
  if (data.description) {
    formData.set("description", data.description);
  }
  return formData;
}

interface GroupsContentProps {
  groups: GroupWithCount[];
  isAdmin: boolean;
  ownerId: number;
}

type ModalState =
  | { type: "closed" }
  | { type: "detail"; group: EnrichedGroupData }
  | { type: "edit"; group: EnrichedGroupData }
  | { type: "create" }
  | { type: "delete"; group: EnrichedGroupData }
  | { type: "addMembers"; group: EnrichedGroupData; memberRows: MemberRow[] };

export function GroupsContent({ groups, isAdmin, ownerId }: GroupsContentProps) {
  const [modal, setModal] = useState<ModalState>({ type: "closed" });
  const [isPending, startTransition] = useTransition();
  const [loadingGroupId, setLoadingGroupId] = useState<number | null>(null);

  const openCreateModal = useCallback(() => {
    setModal({ type: "create" });
  }, []);

  useSetTopBarAction("New Group", openCreateModal);

  const handleCardClick = useCallback((groupId: number) => {
    setLoadingGroupId(groupId);
    startTransition(async () => {
      const result = await fetchEnrichedGroup(groupId);
      setLoadingGroupId(null);
      if (result.success && result.data) {
        setModal({ type: "detail", group: result.data });
      } else {
        toast.error(result.error ?? "Failed to load group details");
      }
    });
  }, []);

  const handleEdit = useCallback(() => {
    if (modal.type === "detail") {
      setModal({ type: "edit", group: modal.group });
    }
  }, [modal]);

  const handleSave = useCallback(
    (data: { name: string; description: string | null }) => {
      if (modal.type !== "edit") return;
      const groupId = modal.group.id;

      startTransition(async () => {
        const result = await updateContactGroup(groupId, buildGroupFormData(data));
        if (result.success) {
          toast.success("Group updated successfully");
          setModal({ type: "closed" });
        } else {
          toast.error(result.error ?? "Failed to update group");
        }
      });
    },
    [modal],
  );

  const handleDelete = useCallback(() => {
    if (modal.type === "edit") {
      setModal({ type: "delete", group: modal.group });
    }
  }, [modal]);

  const handleConfirmDelete = useCallback(() => {
    if (modal.type !== "delete") return;
    const groupId = modal.group.id;

    startTransition(async () => {
      const result = await deleteContactGroup(groupId);
      if (result.success) {
        toast.success("Group deleted successfully");
        setModal({ type: "closed" });
      } else {
        toast.error(result.error ?? "Failed to delete group");
      }
    });
  }, [modal]);

  const handleAddMembersOpen = useCallback(() => {
    if (modal.type !== "edit") return;
    const currentGroup = modal.group;

    startTransition(async () => {
      try {
        const res = await fetch("/api/members");
        if (!res.ok) {
          toast.error("Failed to load members");
          return;
        }

        const allMembers: Array<{ ownerid: number; ownername: string }> = await res.json();
        const currentMemberIds = new Set(currentGroup.members.map((m) => m.memberId));

        const memberRows: MemberRow[] = allMembers.map((m) => ({
          memberId: m.ownerid,
          ownername: m.ownername,
          isOwner: m.ownerid === ownerId,
          isSelected: currentMemberIds.has(m.ownerid),
        }));

        setModal({ type: "addMembers", group: currentGroup, memberRows });
      } catch {
        toast.error("Failed to load members");
      }
    });
  }, [modal, ownerId]);

  const handleSelectionChange = useCallback(
    (memberId: number, selected: boolean) => {
      if (modal.type !== "addMembers") return;

      setModal({
        ...modal,
        memberRows: modal.memberRows.map((row) => (row.memberId === memberId ? { ...row, isSelected: selected } : row)),
      });
    },
    [modal],
  );

  const handleConfirmAddMembers = useCallback(() => {
    if (modal.type !== "addMembers") return;
    const groupId = modal.group.id;
    const currentGroup = modal.group;
    const currentMemberIds = new Set(currentGroup.members.map((m) => m.memberId));

    const newMembers = modal.memberRows
      .filter((row) => row.isSelected && !currentMemberIds.has(row.memberId))
      .map((row) => ({ memberId: row.memberId }));

    if (newMembers.length === 0) {
      setModal({ type: "edit", group: currentGroup });
      return;
    }

    startTransition(async () => {
      const result = await addMembers({ groupId, members: newMembers });
      if (result.success) {
        toast.success(`Added ${result.data?.count ?? newMembers.length} member(s)`);
        const refreshed = await fetchEnrichedGroup(groupId);
        if (refreshed.success && refreshed.data) {
          setModal({ type: "edit", group: refreshed.data });
        } else {
          setModal({ type: "closed" });
        }
      } else {
        toast.error(result.error ?? "Failed to add members");
      }
    });
  }, [modal]);

  const handleCreateSubmit = useCallback((data: { name: string; description: string | null }) => {
    startTransition(async () => {
      const result = await createContactGroup(buildGroupFormData(data));
      if (result.success) {
        toast.success("Group created successfully");
        setModal({ type: "closed" });
      } else {
        toast.error(result.error ?? "Failed to create group");
      }
    });
  }, []);

  const closeModal = useCallback(() => {
    setModal({ type: "closed" });
  }, []);

  const handleDeleteCancel = useCallback(() => {
    if (modal.type === "delete") {
      setModal({ type: "edit", group: modal.group });
    }
  }, [modal]);

  const handleAddMembersCancel = useCallback(() => {
    if (modal.type === "addMembers") {
      setModal({ type: "edit", group: modal.group });
    }
  }, [modal]);

  return (
    <div>
      <h1 className="font-angkor text-2xl text-prfc-brown mb-6">{isAdmin ? "Groups" : "My Groups"}</h1>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {groups.map((group) => (
          <div key={group.id} className="relative">
            <EntityCard
              variant="group"
              name={group.name}
              memberCount={group.memberCount}
              description={group.description}
              onClick={() => handleCardClick(group.id)}
            />
            {loadingGroupId === group.id ? (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/60">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-prfc-brown border-t-transparent" />
              </div>
            ) : null}
          </div>
        ))}
        <EntityCard variant="add" onClick={openCreateModal} />
      </div>

      <GroupDetailViewModal
        open={modal.type === "detail"}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
        group={modal.type === "detail" ? modal.group : EMPTY_GROUP}
        onEdit={handleEdit}
        onViewAllMembers={handleEdit}
      />

      <GroupEditModal
        key={modal.type === "edit" ? modal.group.id : "closed"}
        open={modal.type === "edit"}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
        group={modal.type === "edit" ? modal.group : EMPTY_GROUP}
        onSave={handleSave}
        onDelete={handleDelete}
        onAddMembers={handleAddMembersOpen}
        isSubmitting={modal.type === "edit" && isPending}
      />

      <CreateGroupModal
        open={modal.type === "create"}
        onOpenChange={(open) => {
          if (!open) closeModal();
        }}
        onSubmit={handleCreateSubmit}
        isSubmitting={modal.type === "create" && isPending}
      />

      <DeleteGroupModal
        open={modal.type === "delete"}
        onOpenChange={(open) => {
          if (!open) handleDeleteCancel();
        }}
        groupName={modal.type === "delete" ? modal.group.name : ""}
        onConfirm={handleConfirmDelete}
        isDeleting={modal.type === "delete" && isPending}
      />

      <AddMembersModal
        open={modal.type === "addMembers"}
        onOpenChange={(open) => {
          if (!open) handleAddMembersCancel();
        }}
        groupName={modal.type === "addMembers" ? modal.group.name : ""}
        members={modal.type === "addMembers" ? modal.memberRows : []}
        onSelectionChange={handleSelectionChange}
        onConfirm={handleConfirmAddMembers}
        isSubmitting={modal.type === "addMembers" && isPending}
      />
    </div>
  );
}
