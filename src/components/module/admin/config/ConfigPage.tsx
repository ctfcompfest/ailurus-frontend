import React, { ReactElement, useContext, useEffect, useState } from "react";
import { AdminContext } from "../AdminContext";
import { ConfigType } from "@/types/common";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { patchAdmin, postAdmin } from "@/components/fetcher/admin";
import { Plus } from "@phosphor-icons/react";
import ConfirmModal from "../../common/Modal/ConfirmModal";

interface ConfigProps {
	configs: ConfigType;
}

export default function ConfigPage() {
	const queryClient = useQueryClient();
	const { contestConfig } = useContext(AdminContext);
	const [editingKey, setEditingKey] = useState<string | null>(null);
	const [editedValue, setEditedValue] = useState("");

	const mutateConfig = useMutation({
		mutationFn: ({ key, value }: ConfigType) =>
			patchAdmin<ConfigType>(`admin/configs/${key}`, {
				json: {
					value: value,
				},
			}),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["config"] });
		},
	});

	const handleEdit = (key: string, value: string) => {
		setEditingKey(key);
		setEditedValue(value);
	};

	const handleSave = (key: string) => {
		mutateConfig.mutate({ key: key, value: editedValue });
		setEditingKey(null);
	};

	const handleCancel = () => {
		setEditingKey(null);
		setEditedValue("");
	};

	const resetGameMutation = useMutation({
		mutationFn: () =>
			postAdmin(`admin/contests/reset-game/`, {
				json: { confirm: true },
			}),
	});
	const CONFIG_GROUPS: Record<string, string[]> = {
		General: ["EVENT_NAME", "LOGO_URL", "SERVICE_MODE", "UNLOCK_MODE"],
		"Contest Progress": [
			"CURRENT_TICK",
			"CURRENT_ROUND",
			"LAST_TICK_CHANGE",
			"FREEZE_TICK",
			"FREEZE_ROUND",
			"LAST_PAUSED",
		],
		Time: ["START_TIME", "ATTACK_TIME", "FREEZE_TIME", "IS_CONTEST_PAUSED"],
		"Game Stage": ["NUMBER_ROUND", "NUMBER_TICK", "TICK_DURATION"],
		Flag: ["FLAG_FORMAT", "FLAG_RNDLEN"],
		Other: [],
	};
	CONFIG_GROUPS["Other"] = Object.keys(contestConfig).filter((key) =>
		Object.keys(CONFIG_GROUPS)
			.map((e) => CONFIG_GROUPS[e].indexOf(key) !== -1)
			.every((elm) => elm === false),
	);

	return (
		<div className="px-4 mb-5">
			<div className="flex flex-row justify-between mb-4">
				<h2 className="pt-2 pb-4 text-2xl font-bold">Configuration</h2>
				<ConfirmModal
					action="Reset"
					btn={<button className="btn btn-error">Reset Game Data</button>}
					onAction={() => resetGameMutation.mutate()}
				>
					Flag, submission, game progress will be <u>deleted</u>. Are you sure?
				</ConfirmModal>
			</div>
			{Object.entries(CONFIG_GROUPS).map(([group_name, keys]) => (
				<div className="my-5" key={group_name}>
					<div className="my-2 flex flex-row justify-between items-center gap-4">
						<div className="flex flex-col gap-2">
							<strong className="font-strong text-lg">{group_name}</strong>
						</div>
					</div>
					{keys.map((elm) => (
						<div
							className="bg bg-neutral px-4 py-2 rounded-md grid grid-cols-7 gap-4 mb-3"
							key={elm}
						>
							<React.Fragment>
								<div className="flex flex-row col-span-2 items-center">
									<strong>{elm}:</strong>
								</div>
								<div className="flex flex-row items-center col-span-4 w-full">
									{editingKey === elm ? (
										<input
											className="input input-bordered w-full"
											value={editedValue}
											onChange={(e) => setEditedValue(e.target.value)}
										/>
									) : (
										<div className="text-ellipsis overflow-hidden">
											{contestConfig[elm]}
										</div>
									)}
								</div>
								<div className="flex flex-row items-center gap-2 justify-end">
									{editingKey === elm ? (
										<>
											<button
												className="btn btn-primary btn-sm"
												onClick={() => handleSave(elm)}
											>
												Save
											</button>
											<button
												className="btn btn-secondary btn-sm"
												onClick={handleCancel}
											>
												Cancel
											</button>
										</>
									) : (
										<button
											className="btn btn-secondary btn-sm"
											onClick={() => handleEdit(elm, contestConfig[elm])}
										>
											Edit
										</button>
									)}
								</div>
							</React.Fragment>
						</div>
					))}
				</div>
			))}
		</div>
	);
}
