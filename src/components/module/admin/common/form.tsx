import React, { useState } from "react";
import { Control, FieldValues, Path, useFormContext } from "react-hook-form";

type GetField<T> = T extends Control<infer TFields> ? TFields : never;

interface InputRowProps<T> {
  name: Path<GetField<T>>;
  label: string;
  errorMessage: string;
  type?: React.HTMLInputTypeAttribute;
  control?: T;
  textarea?: boolean;
}

export function InputRow<T extends FieldValues>({
  name,
  label,
  errorMessage,
  type,
  textarea,
}: InputRowProps<T>) {
  const { register } = useFormContext<T>();
  
  return (
    <div className="form-control w-full">
      <label className="label">
        <span className="label-text">{label}</span>
      </label>

      {textarea ? (
        <textarea
          rows={10}
          className="textarea textarea-bordered w-full"
          /* @ts-ignore */
          {...register(name)}
        />
      ) : type === "file" ? (
        <div className="flex flex-row items-center">
          <input
            type="file"
            className="input"
            /* @ts-ignore */
            {...register(name)}
          />
        </div>
      ) : (
        <input
          type={type ? type : "text"}
          className="input input-bordered w-full"
          /* @ts-ignore */
          {...register(name)}
        />
      )}

      {errorMessage && (
        <label className="label">
          <span className="label-text-alt text-red-500">{errorMessage}</span>
        </label>
      )}
    </div>
  );
}
