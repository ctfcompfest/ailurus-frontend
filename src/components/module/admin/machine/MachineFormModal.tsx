import React, { ReactElement, useRef } from "react";
import { ProvisionMachine } from "@/types/provision-machine";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { patchAdmin, postAdmin } from "@/components/fetcher/admin";
import { InputRow } from "../common/form";

type MachineFormAttr = Omit<ProvisionMachine, "detail"> & {
  detail: string;
}

interface ProvisionMachineFormProps {
  mode: "new" | "update";
  machine?: MachineFormAttr;
  machineId?: number;
  onSave?: () => void;
}

function MachineForm({ machine, mode, machineId, onSave }: ProvisionMachineFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<MachineFormAttr>({
    defaultValues: machine,
  });
  const updateOrCreateMutation = useMutation({
    mutationFn: (data: MachineFormAttr) => {
      return (mode == "new") ? 
        postAdmin("admin/machines", { json: [{...data, detail: JSON.parse(data["detail"])}] }) :
        patchAdmin(`admin/machines/${machineId}`, { json: {...data, detail: JSON.parse(data["detail"])} });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({queryKey: ["machines"]});
    },
  });

  return (
    <FormProvider {...form}>
      <h4 className="font-bold text-xl">{mode == "new" ? "New Machine":"Edit Machine"}</h4>
      <form
        onSubmit={form.handleSubmit((data) => {
          updateOrCreateMutation.mutate(data);
          onSave?.();
          if (mode == "new") form.reset();
        })}
      >
        {mode == "new" ? 
          <></>:<div className="form-control">
            <label className="label">
              <span className="label-text">Machine ID</span>
            </label>
            <input
              type="number"
              value={machineId}
              className="input input-bordered"
              readOnly
              disabled
            />
          </div>
        }
        
        <InputRow
          name="name"
          label="Name"
          errorMessage={form.formState.errors.name?.message ?? ""}
          control={form.control}
        />
        <InputRow
          name="host"
          label="Host"
          errorMessage={form.formState.errors.host?.message ?? ""}
          control={form.control}
        />
        <InputRow
          name="port"
          label="Port"
          errorMessage={form.formState.errors.port?.message ?? ""}
          control={form.control}
        />
        <InputRow
          name="detail"
          label="Detail (JSON format)"
          errorMessage={form.formState.errors.detail?.message ?? ""}
          control={form.control}
          textarea
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


export default function MachineFormModal({
  machine,
  machineId,
  btn,
  mode,
}: ProvisionMachineFormProps & {
  btn: ReactElement,
}) {
  const ref = useRef<HTMLDialogElement>(null);
  return (
    <>
      <a onClick={() => ref.current?.showModal()}>{btn}</a>
      <dialog className="modal" ref={ref}>
        <div className="modal-box">
          <MachineForm
            mode={mode}
            machine={machine}
            machineId={machineId}
            onSave={mode=="new" ? () => ref.current?.close():undefined}
          />
        </div>
        <form method="dialog" className="modal-backdrop">
          <button>close</button>
        </form>
      </dialog>
    </>
  );
}
