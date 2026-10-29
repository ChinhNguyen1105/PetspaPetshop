import React, { useEffect, useState } from "react";
import { User } from "lucide-react";
import { useUserStore } from "../../store/userStore.js";

const UserAvatar = ({
  user,
  className = "w-11 h-11",
  onClick,
  type = "button",
  ...props
}) => {
  const [imageSrc, setImageSrc] = useState("");
  const downloadAvatar = useUserStore((state) => state.downloadAvatar);

  const fileName = user?.avatarUrl || user?.avatar || "";

  useEffect(() => {
    let cancelled = false;
    let objectUrl = null;

    setImageSrc("");

    if (!fileName) {
      return undefined;
    }

    if (/^https?:\/\//i.test(fileName)) {
      setImageSrc(fileName);
      return undefined;
    }

    const loadAvatar = async () => {
      try {
        const result = await downloadAvatar(fileName);

        if (cancelled) return;

        if (!(result instanceof Blob) || result.size === 0) {
          throw new Error("Dữ liệu avatar không hợp lệ.");
        }

        objectUrl = URL.createObjectURL(result);
        setImageSrc(objectUrl);
      } catch (error) {
        if (!cancelled) {
          console.error(
            `Không thể tải avatar của ${user?.name || user?.id}:`,
            error,
          );
          setImageSrc("");
        }
      }
    };

    loadAvatar();

    return () => {
      cancelled = true;

      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [fileName, user?.id, user?.name, downloadAvatar]);

  const handleClick = (event) => {
    if (typeof onClick !== "function") return;

    onClick(event);
  };

  return (
    <button
      type={type}
      onClick={handleClick}
      aria-label={user?.name || "User Avatar"}
      aria-haspopup={onClick ? "menu" : undefined}
      className={[
        className,
        "relative box-border shrink-0",
        "bg-gray-100 rounded-full overflow-hidden",
        "border border-gray-200",
        "flex items-center justify-center",
        "shadow-inner p-0",
        "select-none",
        "[-webkit-tap-highlight-color:transparent]",
        onClick
          ? "cursor-pointer active:scale-95 transition-transform touch-manipulation"
          : "cursor-default",
      ].join(" ")}
      {...props}
    >
      {imageSrc ? (
        <img
          src={imageSrc}
          alt={user?.name || "User Avatar"}
          draggable={false}
          className="block w-full h-full object-cover pointer-events-none"
          onError={() => setImageSrc("")}
        />
      ) : (
        <User
          size={18}
          aria-hidden="true"
          className="text-gray-400 pointer-events-none"
        />
      )}
    </button>
  );
};

export default UserAvatar;
