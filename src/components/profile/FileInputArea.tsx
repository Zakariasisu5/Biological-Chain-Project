import React, { ChangeEvent } from "react";

export type FileInputAreaProps = {
  id: string;
  type: string; // you can replace with LegacyFileType if strict typing is needed
  onChange?: (file: File | ChangeEvent<HTMLInputElement>) => void;
};

export function FileInputArea({ id, type, onChange }: FileInputAreaProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange?.(file);
    } else {
      onChange?.(e);
    }
  };

  return (
    <div
      className="w-full flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 hover:border-primary transition"
    >
      <input
        id={id}
        type="file"
        accept={type === "any" ? "*" : type}
        onChange={handleChange}
        className="hidden"
      />
      <label
        htmlFor={id}
        className="cursor-pointer text-sm text-muted-foreground hover:text-primary"
      >
        Click to upload or drag & drop a file here
      </label>
    </div>
  );
}
