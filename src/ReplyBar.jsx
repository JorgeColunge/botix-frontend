import { useEffect, useRef, useState } from "react";
import { usePopper } from "react-popper";

export const ReplyBar = () => {

    const [referenceElement, setReferenceElement] = useState(null);
    const [popperElement, setPopperElement] = useState(null);
    const { styles, attributes } = usePopper(referenceElement, popperElement, {
      placement: 'top-start', // O 'bottom-start' si prefieres que aparezca abajo
      modifiers: [
        {
          name: 'offset',
          options: {
            offset: [30, 15], // Ajusta el desplazamiento según sea necesario
          },
        },
        {
          name: 'preventOverflow',
          options: {
            boundary: 'viewport', // Asegura que el popper no se salga de la vista
          },
        },
      ],
    });
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const textInputRef = useRef(null);
    const fileInputRef = useRef(null);
    const [fileMenuVisible, setFileMenuVisible] = useState(false);
    const [fileInputType, setFileInputType] = useState('');

    useEffect(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
        const position = cursorPosition !== null ? cursorPosition : messageText.length;
        textInputRef.current.setSelectionRange(position, position);
      }
    }, [showEmojiPicker]);

    useEffect(() => {
      const handleClickOutsideEmoji = (event) => {
        if (popperElement && !popperElement.contains(event.target) && !referenceElement.contains(event.target)) {
          setShowEmojiPicker(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutsideEmoji);
      return () => {
        document.removeEventListener('mousedown', handleClickOutsideEmoji);
      };
    }, [popperElement, referenceElement]);

    useEffect(() => {
      const handleClickOutsideFile = (event) => {
        if (popperElement && !popperElement.contains(event.target) && !referenceElement.contains(event.target)) {
          setFileMenuVisible(false);
        }
      };
      document.addEventListener('mousedown', handleClickOutsideFile);
      return () => {
        document.removeEventListener('mousedown', handleClickOutsideFile);
      };
    }, [popperElement, referenceElement]);

    const handleSendMessage = async () => {
      if (!currentConversation || !messageText.trim()) return;
    
      const textToSend = messageText;
      console.log("Texto a enviar:", textToSend);
    
      setMessageText('');
    
      var currentSend = {
        ...currentConversation,
        last_message_time: new Date().toISOString()
      };
    
      console.log("Datos de currentSend:", currentSend);
    
      try {
        setConversacionActual({...currentSend, position_scroll: true})
        console.log("Intentando enviar mensaje...");
        const response = await axios.post(`${process.env.REACT_APP_API_URL}/api/messages/send-text`, {
          phone: currentSend.phone_number,
          messageText: textToSend,
          conversationId: currentSend.conversation_id
        });
    
        console.log('Respuesta recibida:', response);
    
        if (response.data) {
          setMessages(prevMessages => ({
            ...prevMessages,
            [currentSend.conversation_id]: [...prevMessages[currentSend.conversation_id], response.data.data]
          }));
        } else {
          console.log("La respuesta no tiene datos:", response);
        }
    
      } catch (error) {
        console.error('Error al enviar el mensaje:', error.response ? error.response.data : error.message);
      }
    };
    

    const handleKeyDown = (event) => {
      if (event.key === 'Enter' && event.shiftKey) {
        // Allow line break
      } else if (event.key === 'Enter') {
        event.preventDefault();
        handleSendMessage();
      }
    };

    const handleEmojiClick = () => {
      setShowEmojiPicker(!showEmojiPicker);
    };

    const onEmojiClick = (emojiObject, event) => {
      const cursorPosition = textInputRef.current.selectionStart;
      const newText = messageText.substring(0, cursorPosition) + emojiObject.emoji + messageText.substring(cursorPosition);
      setMessageText(newText);
      setCursorPosition(cursorPosition + 1);
    };

    const handleAttachClick = () => {
      setFileMenuVisible(!fileMenuVisible);
    };

    const resetFileInput = () => {
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    const handleFileMenuClick = type => {
      resetFileInput();
      setFileInputType(type);
      setTimeout(() => {
        fileInputRef.current.click();
      }, 100);
    };

    const handleTextChange = (e) => {
      setMessageText(e.target.value);
      setCursorPosition(e.target.selectionStart);
    };

    return (
      <div className="reply-bar-container">
        {!isMobile && (
          <Button variant="light" className="reply-button p-0 m-0" onClick={handleOpenTemplateModal}>
            <i className="far fa-file-alt"></i> {/* Icono de la plantilla */}
          </Button>
        )}
  


        {showEmojiPicker && (
          <div style={styles.popper} {...attributes.popper}>
            <EmojiPicker  disabled={isLastMessageOlderThan24Hours()} onEmojiClick={onEmojiClick} />
          </div>
        )}
  
  
  
        <TextareaAutosize
          className="message-input"
          placeholder="Escribe un mensaje aquí..."
          value={messageText}
          onChange={handleTextChange}
          onKeyDown={handleKeyDown}
          maxRows={4}
          ref={textInputRef}
          disabled={isLastMessageOlderThan24Hours()}
        />
        
        {fileMenuVisible && (
          <div ref={setPopperElement} style={styles.popper} {...attributes.popper}>
            <div className='d-flex flex-column'>
              <Button variant="light"  disabled={isLastMessageOlderThan24Hours()} onClick={() => handleFileMenuClick('image/*')}>Cargar Imagen</Button>
              <Button variant="light"  disabled={isLastMessageOlderThan24Hours()} onClick={() => handleFileMenuClick('video/*')}>Cargar Video</Button>
              <Button variant="light"  disabled={isLastMessageOlderThan24Hours()} onClick={() => handleFileMenuClick('.pdf,.doc,.docx,.txt')}>Cargar Documento</Button>
              {isMobile && (
                <Button variant="light"  disabled={isLastMessageOlderThan24Hours()} onClick={() => handleOpenTemplateModal()}>Cargar Plantillas</Button>
              )}
            </div>
          </div>
        )}
        <Button variant="light"  disabled={isLastMessageOlderThan24Hours()} className="reply-button" onClick={handleAttachClick}>
          <i className="fas fa-paperclip"></i> {/* Icono del clip */}
        </Button>
        <Button variant="light"  disabled={isLastMessageOlderThan24Hours()} className="reply-button" onClick={handleEmojiClick} ref={setReferenceElement}>
          <i className="far fa-smile"></i> {/* Icono de la cara feliz */}
        </Button>
        
        <AudioRecorder  inactivo={isLastMessageOlderThan24Hours} onSend={handleSendAudio} />
      </div>
    );
  }