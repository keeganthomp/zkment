import * as React from "react";
import { cn } from "@/lib/utils";
import { LoaderIcon } from "lucide-react";

const spinnerVariants = "w-16 h-16 rounded-full animate-spin";

interface LoaderProps extends React.HTMLAttributes<SVGSVGElement> {
  className?: string;
}

const Loader = React.forwardRef<SVGSVGElement, LoaderProps>((props, ref) => {
  const { className, ...rest } = props;
  return (
    <LoaderIcon
      ref={ref}
      className={cn(spinnerVariants, className)}
      {...rest}
    />
  );
});

Loader.displayName = "Loader";

export { Loader };
