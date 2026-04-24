import { useCallback, useEffect } from "react";

/**
 * 이미지 확대 보기 모달
 */
export default function ModalImage({
	imageUrl,
}) {
	
	return (
		<div className="flex align-center justify-center overflow-auto grow gap-5 px-6 py-5">
			<img src={imageUrl} alt="확대된 이미지" className="w-auto h-auto rounded-lg" />
		</div>
	);
}
