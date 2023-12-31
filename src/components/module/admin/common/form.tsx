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
          className="textarea textarea-bordered w-full"
          /* @ts-ignore */
          {...register(name)}
        />
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
          <span className="label-text-alt">{errorMessage}</span>
        </label>
      )}
    </div>
  );
}
