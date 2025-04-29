import {BottomSheetBackdrop, BottomSheetModal} from '@gorhom/bottom-sheet';
import {useBottomSheetBackHandler} from '@/hooks/utility/useBottomSheetBackHandler';
import React, {useCallback, useMemo, useState} from 'react';
import {Scanner} from '@/components/ScanQRCodeModal/Scanner';
import {MyQRCode} from '@/components/ScanQRCodeModal/MyQRCode';

interface Props {
    mode: 'scan' | 'share';
}

const ScanQRCodeModal = (props: Props, ref: any) => {
    const {handleSheetPositionChange} = useBottomSheetBackHandler(ref);
    const snapPoints = useMemo(() => ['100%'], []);
    const renderBackdrop = useCallback(
        (props: any) => <BottomSheetBackdrop {...props} opacity={0.85} disappearsOnIndex={-1} appearsOnIndex={0} />,
        [],
    );

    const [mode, setMode] = useState(props.mode);

    const onClose = () => {
        ref.current.close();
    };
    const toggleMode = () => {
        setMode(m => (m === 'scan' ? 'share' : 'scan'));
    };

    const onSheetPositionChange = (index: number) => {
        handleSheetPositionChange(index);
        if (index < 0) {
            setMode(props.mode);
        }
    };

    return (
        <BottomSheetModal
            enablePanDownToClose
            ref={ref}
            onChange={onSheetPositionChange}
            backdropComponent={renderBackdrop}
            handleComponent={null}
            backgroundComponent={() => null}
            snapPoints={snapPoints}>
            {mode === 'scan' && <Scanner onClose={onClose} onToggle={toggleMode} />}
            {mode === 'share' && <MyQRCode onClose={onClose} onToggle={toggleMode} />}
        </BottomSheetModal>
    );
};

export default React.forwardRef(ScanQRCodeModal);
