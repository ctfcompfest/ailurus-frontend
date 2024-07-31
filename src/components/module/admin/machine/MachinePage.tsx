import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { deleteAdmin, getAdmin } from "@/components/fetcher/admin";
import { ProvisionMachine } from "@/types/provision-machine";
import MachineFormModal from "./MachineFormModal";
import { Plus } from "@phosphor-icons/react";

function MachineRow({ machine }: { machine: ProvisionMachine }) {
  const queryClient = useQueryClient();
  const deleteMachine = useMutation({
    mutationFn: () => deleteAdmin(`admin/machines/${machine.id}`),
    onSuccess: () => {
      queryClient.invalidateQueries(["machines"]);
    },
  });
  return (
    <div
      className="p-4 rounded-md bg-neutral text-neutral-content flex flex-row justify-between items-center"
      key={machine.id}
    >
      <div className="flex flex-col gap-1">
        {machine.name}
      </div>

      <div className="flex flex-row gap-2 items-center">
        <MachineFormModal
          btn={<button className="btn btn-secondary btn-sm">Edit</button>}
          machine={{
            ...machine,
            detail: JSON.stringify(machine.detail, null, 2),
          }}
          machineId={machine.id}
          mode="update"
        />

        <button
          className="btn btn-error btn-sm"
          onClick={() => {
            deleteMachine.mutate();
          }}
        >
          Delete
        </button>
      </div>
    </div>
  );
}

export default function MachinePage() {
  const { isLoading, data } = useQuery({
    queryKey: ["machines"],
    queryFn: () => getAdmin<ProvisionMachine[]>("admin/machines/"),
  });

  return (
    <div className="px-4">
      <div className="flex flex-row justify-between">
        <h2 className="pt-2 pb-4 text-2xl font-bold">Machine</h2>
        <MachineFormModal
          btn={
            <button className="btn btn-primary">
              <Plus size={18} /> Add Machine
            </button>
          }
          mode="new"
        />
      </div>
      <p className="text-sm mb-3">
        List of machine, cloud services, API endpoint, or any other things to provision and manage team&apos;s services.
      </p>
      
      {isLoading ? (
        <div className="flex items-center justify-center">
          <span className="loading loading-spinner loading-lg"></span>
        </div>
      ) : !!!data ? (
        <div className="flex items-center justify-center">
          No server to show
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {data.data.map((machine) => (
            <MachineRow machine={machine} key={machine.id} />
          ))}
        </div>
      )}
    </div>
  );
}