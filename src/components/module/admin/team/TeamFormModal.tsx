import React, {
  ReactElement,
  useRef,
} from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postAdmin, patchAdmin } from "@/components/fetcher/admin";
import { InputRow } from "../common/form";

type TeamInput = {
  name: string;
  email: string;
  password: string | undefined;
};

type TeamFormProps =
  | {
      mode: "new";
      teamId: undefined;
      team: undefined;
      onSave?: () => any;
    }
  | {
      mode: "update";
      teamId: number;
      team: Partial<TeamInput> | undefined;
      onSave?: () => any;
    };

function TeamForm({ team, mode, teamId, onSave }: TeamFormProps) {
  const queryClient = useQueryClient();
  const methods = useForm<TeamInput>({
    defaultValues: team,
  });
  const updateOrCreateMutation = useMutation({
    mutationFn: (data: TeamInput) =>
      mode === "new"
        ? postAdmin("admin/teams/", { json: [data] })
        : patchAdmin(`admin/teams/${teamId}`, { json: data }),
      onSuccess: () => queryClient.invalidateQueries({ queryKey: ["teams"] }),
  });

  return (
    <FormProvider {...methods}>
      <h4 className="font-bold text-xl">New Team</h4>
      <form
        onSubmit={methods.handleSubmit((data: TeamInput) => {
          const cleanedData = Object.fromEntries(
            Object.entries(data).filter(([_, value]) => value !== "")
          );

          updateOrCreateMutation.mutate(cleanedData as TeamInput);
          onSave?.();
        })}
      >
        <div className="form-control">
          <label className="label">
            <span className="label-text">Team ID</span>
          </label>
          <input
            type="text"
            value={teamId}
            className="input input-bordered"
            readOnly
            disabled
          />
        </div>
        <InputRow
          name="name"
          label="Team Name"
          errorMessage={methods.formState.errors.name?.message ?? ""}
          control={methods.control}
        />
        <InputRow
          name="email"
          label="Email"
          errorMessage={methods.formState.errors.email?.message ?? ""}
          control={methods.control}
        />
        <InputRow
          name="password"
          label="Password"
          errorMessage={methods.formState.errors.password?.message ?? ""}
          type="password"
          control={methods.control}
        />
        <InputRow
          name="testcase"
          label="Testcase Zip File"
          type="file"
          control={methods.control}
        />

        <div className="flex flex-row justify-end pt-4">
          <button className="btn btn-primary" type="submit">
            Save
          </button>
        </div>
      </form>
    </FormProvider>
  );
}

export default function TeamFormModal({
  team,
  btn,
  mode,
  teamId,
}: TeamFormProps & {
  btn: ReactElement;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <a onClick={() => ref.current?.showModal()}>{btn}</a>
      <dialog className="modal" ref={ref}>
        <div className="modal-box">
          {/* @ts-ignore */}
          <TeamForm
            team={team}
            mode={mode}
            teamId={teamId}
            onSave={() => ref.current?.close()}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
