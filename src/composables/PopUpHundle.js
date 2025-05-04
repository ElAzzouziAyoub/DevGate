export function hundlePopUp(mode, content, confEvent=null, modeRef, contentRef, typeRef, colorRef, confRef) {
    if(mode == 0) {
        modeRef.value = false;
    } else if(mode == 1) {
        if(confEvent !== null) {
            modeRef.value = true;
            typeRef.value = 'Success';
            contentRef.value = content;
            colorRef.value = "#256900";
            confRef.value = confEvent;
        }
    } else if(mode == 2) {
        if(confEvent !== null) {
            modeRef.value = true;
            typeRef.value = 'Warning';
            contentRef.value = content;
            colorRef.value = "#004BE0";
            confRef.value = confEvent;
        }
    } else if(mode == 3) {
        modeRef.value = true;
        typeRef.value = 'Info';
        contentRef.value = content;
        colorRef.value = "#AC8400";
        confRef.value = confEvent;
    } else {
        modeRef.value = true;
        typeRef.value = 'Critical';
        contentRef.value = content;
        colorRef.value = "#E00000";
    }
}