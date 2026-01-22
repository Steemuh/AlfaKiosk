import NextImage, { type ImageProps } from "next/image";

export const ProductImageWrapper = (props: ImageProps) => {
	return (
		<div className="aspect-[4/5] overflow-hidden bg-neutral-50">
			<NextImage {...props} className="h-full w-full object-contain object-center p-2" />
		</div>
	);
};
