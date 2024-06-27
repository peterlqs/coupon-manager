import { z } from "zod";

import { useState, useTransition } from "react";
import { useFormStatus } from "react-dom";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useValidatedForm } from "@/lib/hooks/useValidatedForm";

import { type Action, cn } from "@/lib/utils";
import { type TAddOptimistic } from "@/app/(app)/groups/useOptimisticGroups";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useBackPath } from "@/components/shared/BackButton";

import { type Group, insertGroupParams } from "@/lib/db/schema/groups";
import {
  createGroupAction,
  deleteGroupAction,
  updateGroupAction,
} from "@/lib/actions/groups";
import { UserGroup } from "@/lib/db/schema/associative";
import { XIcon } from "lucide-react";
import { getGroupById } from "@/lib/api/groups/queries";

const GroupForm = ({
  group,
  user_emails,
  openModal,
  closeModal,
  addOptimistic,
  postSuccess,
}: {
  group?: Group | null;
  user_emails?: string[];
  openModal?: (group?: Group) => void;
  closeModal?: () => void;
  addOptimistic?: TAddOptimistic;
  postSuccess?: () => void;
}) => {
  // map user_emails to a list of user emails
  const [users, setUsers] = useState<string[]>(user_emails ? user_emails : []);
  const [inputUserValue, setInputUserValue] = useState("");

  const { errors, hasErrors, setErrors, handleChange } =
    useValidatedForm<Group>(insertGroupParams);
  const editing = !!group?.id;

  const [isDeleting, setIsDeleting] = useState(false);
  const [pending, startMutation] = useTransition();

  const router = useRouter();
  const backpath = useBackPath("groups");

  const onSuccess = (
    action: Action,
    data?: { error: string; values: Group }
  ) => {
    const failed = Boolean(data?.error);
    if (failed) {
      openModal && openModal(data?.values);
      toast.error(`Failed to ${action}`, {
        description: data?.error ?? "Error",
      });
    } else {
      router.refresh();
      postSuccess && postSuccess();
      toast.success(`Group ${action}d!`);
      if (action === "delete") router.push(backpath);
    }
  };

  const handleSubmit = async (data: FormData) => {
    setErrors(null);

    const payload = Object.fromEntries(data.entries());

    const groupParsed = await insertGroupParams.safeParseAsync({ ...payload });

    if (!groupParsed.success) {
      setErrors(groupParsed?.error.flatten().fieldErrors);
      return;
    }

    closeModal && closeModal();
    const values = groupParsed.data;
    const pendingGroup: Group = {
      updatedAt: group?.updatedAt ?? new Date(),
      createdAt: group?.createdAt ?? new Date(),
      userId: group?.userId ?? "",
      id: group?.id ?? "",
      ...values,
    };
    try {
      startMutation(async () => {
        addOptimistic &&
          addOptimistic({
            data: pendingGroup,
            action: editing ? "update" : "create",
          });
        const error = editing
          ? await updateGroupAction(
              {
                ...values,
                id: group.id,
              },
              users,
              user_emails
            )
          : await createGroupAction(values, users);

        const errorFormatted = {
          error: error ?? "Error",
          values: pendingGroup,
        };
        onSuccess(
          editing ? "update" : "create",
          error ? errorFormatted : undefined
        );
      });
    } catch (e) {
      if (e instanceof z.ZodError) {
        setErrors(e.flatten().fieldErrors);
      }
    }
  };

  return (
    <form action={handleSubmit} onChange={handleChange} className={"space-y-3"}>
      {/* Schema fields start */}
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.name ? "text-destructive" : ""
          )}
        >
          Name
        </Label>
        <Input
          type="text"
          name="name"
          className={cn(errors?.name ? "ring ring-destructive" : "")}
          defaultValue={group?.name ?? ""}
        />
        {errors?.name && (
          <p className="text-xs text-destructive mt-2">{errors.name[0]}</p>
        )}
      </div>
      <div>
        <Label
          className={cn(
            "mb-2 inline-block",
            errors?.description ? "text-destructive" : ""
          )}
        >
          Description{" "}
          <span className="text-sm text-slate-600 dark:text-slate-400">
            (optional)
          </span>
        </Label>
        <Input
          type="text"
          name="description"
          className={cn(errors?.description ? "ring ring-destructive" : "")}
          defaultValue={group?.description ?? ""}
        />
        {errors?.description && (
          <p className="text-xs text-destructive mt-2">
            {errors.description[0]}
          </p>
        )}
      </div>
      {/* Add users to group */}
      <div>
        <Label className={cn("mb-2 inline-block")}>Users (optional)</Label>
        <div className="flex gap-2">
          <Input
            type="email"
            value={inputUserValue}
            onChange={(e) => setInputUserValue(e.target.value)}
          />{" "}
          <Button
            type="button"
            onClick={() => {
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailRegex.test(inputUserValue)) {
                setUsers([...users, inputUserValue]);
                setInputUserValue("");
              } else {
                // Handle invalid email (e.g., show an error message)
                alert("Please enter a valid email address.");
              }
            }}
          >
            Add User
          </Button>
        </div>
        <div className="flex flex-wrap gap-1 mt-2 text-xs">
          {users.map((user, index) => (
            <Button
              variant={"secondary"}
              size={"sm"}
              key={index}
              className="p-2"
              onClick={() => {
                setUsers(users.filter((u) => u !== user));
              }}
            >
              {user} <XIcon className="h-4" />
            </Button>
          ))}
        </div>
      </div>
      {/* Schema fields end */}

      {/* Save Button */}
      <SaveButton errors={hasErrors} editing={editing} />

      {/* Delete Button */}
      {editing ? (
        <Button
          type="button"
          disabled={isDeleting || pending || hasErrors}
          variant={"destructive"}
          onClick={() => {
            setIsDeleting(true);
            closeModal && closeModal();
            startMutation(async () => {
              addOptimistic && addOptimistic({ action: "delete", data: group });
              const error = await deleteGroupAction(group.id);
              setIsDeleting(false);
              const errorFormatted = {
                error: error ?? "Error",
                values: group,
              };

              onSuccess("delete", error ? errorFormatted : undefined);
            });
          }}
        >
          Delet{isDeleting ? "ing..." : "e"}
        </Button>
      ) : null}
    </form>
  );
};

export default GroupForm;

const SaveButton = ({
  editing,
  errors,
}: {
  editing: Boolean;
  errors: boolean;
}) => {
  const { pending } = useFormStatus();
  const isCreating = pending && editing === false;
  const isUpdating = pending && editing === true;
  return (
    <Button
      type="submit"
      className="mr-2"
      disabled={isCreating || isUpdating || errors}
      aria-disabled={isCreating || isUpdating || errors}
    >
      {editing
        ? `Sav${isUpdating ? "ing..." : "e"}`
        : `Creat${isCreating ? "ing..." : "e"}`}
    </Button>
  );
};
