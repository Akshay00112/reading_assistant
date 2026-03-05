from flask import Blueprint, request, jsonify, send_from_directory
from urllib.parse import quote
import PyPDF2
import io
import re
import os

# ---------- BLUEPRINT ----------
practice_bp = Blueprint('practice', __name__)

# ---------- PRONUNCIATION EVALUATION ----------
from difflib import SequenceMatcher


# ---------- PDF SENTENCE EXTRACTION ----------
def extract_sentences_from_pdf(pdf_file):
    """Extract sentences from PDF file object"""
    try:
        pdf_reader = PyPDF2.PdfReader(pdf_file)
        all_sentences = []

        print(f"[PDF] Processing PDF with {len(pdf_reader.pages)} pages")

        for page_num in range(len(pdf_reader.pages)):
            page = pdf_reader.pages[page_num]
            text = page.extract_text()

            if text:
                sentences = re.split(r'[.!?]+', text)

                for sentence in sentences:
                    sentence = sentence.strip()
                    if sentence and len(sentence) > 10:
                        all_sentences.append({
                            'text': sentence,
                            'page': page_num + 1,
                            'line': len(all_sentences) + 1,
                            'original_text': sentence
                        })

        print(f"[OK] Extracted {len(all_sentences)} sentences")
        return all_sentences

    except Exception as e:
        print(f"[ERROR] PDF extraction error: {e}")
        raise e


# ---------- PDF UPLOAD ----------
@practice_bp.route('/upload-pdf', methods=['POST'])
def upload_pdf_practice():
    print("[API] PDF upload endpoint called")

    try:
        if 'pdf' not in request.files:
            return jsonify({'error': 'No PDF file provided'}), 400

        pdf_file = request.files['pdf']
        print(f"[PDF] Received file: {pdf_file.filename}")

        if pdf_file.filename == '':
            return jsonify({'error': 'No file selected'}), 400

        if not pdf_file.filename.lower().endswith('.pdf'):
            return jsonify({'error': 'File must be a PDF'}), 400

        from werkzeug.utils import secure_filename

        upload_dir = os.path.join(os.path.dirname(os.path.dirname(__file__)),
                                  'static', 'uploads')
        os.makedirs(upload_dir, exist_ok=True)

        filename = secure_filename(pdf_file.filename)
        file_path = os.path.join(upload_dir, filename)

        pdf_file.seek(0)
        pdf_file.save(file_path)

        # Use the central PDFProcessor for consistent line-by-line extraction
        from models.pdf_processor import PDFProcessor
        processor = PDFProcessor()
        sentences = processor.extract_text_with_positions(file_path)

        if not sentences:
            return jsonify({
                'success': False,
                'error': 'No readable text found in PDF'
            }), 400

        pdf_url = f'/api/practice/files/{quote(filename)}'

        return jsonify({
            'success': True,
            'filename': pdf_file.filename,
            'sentences': sentences,
            'total_sentences': len(sentences),
            'pdf_url': pdf_url,
            'message': f'PDF processed successfully! Found {len(sentences)} sentences.'
        })

    except Exception as e:
        print(f"[ERROR] PDF processing error: {str(e)}")
        return jsonify({'error': f'PDF processing failed: {str(e)}'}), 500


# ---------- TTS AUDIO GENERATION ----------
@practice_bp.route('/tts', methods=['POST'])
def get_tts_audio():
    data = request.json
    text = data.get('text')
    
    if not text:
        return jsonify({'error': 'No text provided'}), 400
        
    try:
        from services.speech_service import SpeechService
        speech_service = SpeechService()
        
        audio_bytes = speech_service.generate_tts_audio(text)
        
        if not audio_bytes:
            return jsonify({'error': 'Failed to generate audio'}), 500
            
        return io.BytesIO(audio_bytes).read(), 200, {'Content-Type': 'audio/wav'}
        
    except Exception as e:
        print(f"[ERROR] TTS error: {e}")
        return jsonify({'error': str(e)}), 500


# ---------- TTS SPEAK SENTENCE (Direct Play) ----------
@practice_bp.route('/speak-sentence', methods=['POST'])
def speak_sentence():
    data = request.json
    sentence = data.get('sentence')
    rate = data.get('rate', 150)

    if not sentence:
        return jsonify({'error': 'No sentence provided'}), 400

    try:
        from services.speech_service import SpeechService
        speech_service = SpeechService()

        if rate:
            speech_service.engine.setProperty('rate', rate)

        speech_service.speak(sentence)

        return jsonify({
            'success': True,
            'message': 'Sentence spoken successfully'
        })

    except Exception as e:
        return jsonify({'error': str(e)}), 500


# ---------- PRACTICE SENTENCE ----------
@practice_bp.route('/practice-sentence', methods=['POST'])
def practice_sentence():
    data = request.json
    sentence_text = data.get('sentence')

    if not sentence_text:
        return jsonify({'error': 'No sentence provided'}), 400

    try:
        from services.speech_service import SpeechService
        speech_service = SpeechService()

        result = speech_service.practice_sentence(sentence_text)
        return jsonify(result)

    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e),
            'spoken': None,
            'score': 0.0,
            'is_correct': False,
            'mode': 'error'
        }), 500


# ---------- SERVE UPLOADED FILES ----------
@practice_bp.route('/files/<path:filename>')
def serve_pdf(filename):
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    upload_dir = os.path.join(base_dir, 'static', 'uploads')

    print(f"[DEBUG] Serving PDF: {filename}")

    return send_from_directory(upload_dir, filename)


# ---------- NEW: PRONUNCIATION EVALUATION ----------
@practice_bp.post("/evaluate-pronunciation")
def evaluate_pronunciation():
    """
    Evaluate spoken word pronunciation with detailed feedback
    """
    try:
        audio_file = request.files.get("audio")
        expected_text = request.form.get("word")  # 'word' field is used for historical reasons, but contains full sentence/line

        if not audio_file or not expected_text:
            return jsonify({
                "success": False,
                "message": f"audio and expected text are required. Got: audio={'YES' if audio_file else 'NO'}, word={'YES' if expected_text else 'NO'}"
            }), 400

        audio_bytes = audio_file.read()
        print(f"🎤 Received audio: {len(audio_bytes)} bytes")
        
        if len(audio_bytes) < 100:
            return jsonify({
                "success": False,
                "message": "Audio file too small. Please try recording again."
            }), 400

        # Using SpeechService for transcription and scoring
        from services.speech_service import SpeechService
        speech_service = SpeechService()
        
        try:
            audio_io = io.BytesIO(audio_bytes)
            with sr.AudioFile(audio_io) as source:
                audio_data = speech_service.recognizer.record(source)
        except Exception as audio_err:
            print(f"❌ Audio format error: {audio_err}")
            return jsonify({
                "success": False,
                "is_correct": False,
                "error_type": "audio_format",
                "message": "The audio format from your device is not supported. Please try again or use a different device.",
                "details": str(audio_err)
            }), 400
            
        spoken_text = speech_service.transcribe(audio_data)
        
        if not spoken_text:
            return jsonify({
                "success": True,
                "is_correct": False,
                "score": 0.0,
                "feedback": "Could not understand audio. Please speak clearly.",
                "spoken_text": ""
            })

        # Calculate similarity score
        similarity = speech_service.calculate_similarity(expected_text, spoken_text)
        word_feedback = speech_service._get_word_level_feedback(expected_text, spoken_text)
        
        # Threshold: 0.6 is good for learning
        is_correct = similarity >= 0.6
        
        # Generate friendly, encouraging feedback
        if is_correct:
            if similarity >= 0.95:
                feedback = f"🎉 Perfect! Excellent pronunciation!"
            elif similarity >= 0.85:
                feedback = f"✨ Great job! Very close to perfect!"
            else:
                feedback = f"👏 Good effort! You're making progress!"
        else:
            # Count the errors by type
            mispronounced = sum(1 for w in word_feedback if w.get('status') == 'mispronounced')
            missed = sum(1 for w in word_feedback if w.get('status') == 'missed')
            article_errors = sum(1 for w in word_feedback if w.get('status') == 'article-error')
            
            feedback_parts = []
            if similarity >= 0.4:
                feedback_parts.append("Nice try! Keep working on these words:")
            else:
                feedback_parts.append("Let's focus on these words:")
            
            if article_errors > 0:
                feedback_parts.append(f"• {article_errors} article word(s) (a/an/the) - watch your grammar!")
            if mispronounced > 0:
                feedback_parts.append(f"• {mispronounced} word(s) need clearer pronunciation")
            if missed > 0:
                feedback_parts.append(f"• {missed} word(s) were skipped")
                
            feedback = " ".join(feedback_parts)

        return jsonify({
            "success": True,
            "is_correct": is_correct,
            "score": round(similarity, 2),
            "feedback": feedback,
            "word_feedback": word_feedback,
            "spoken_text": spoken_text
        })

    except Exception as e:
        print("❌ Pronunciation evaluation error:", e)
        import traceback
        error_details = traceback.format_exc()
        print(error_details)
        
        # Log to file for persistent debugging
        try:
            with open("backend_errors.log", "a") as f:
                f.write(f"\n--- ERROR AT {time.strftime('%Y-%m-%d %H:%M:%S')} ---\n")
                f.write(error_details)
                f.write("\n-----------------------------------\n")
        except:
            pass

        return jsonify({
            "success": False,
            "error": str(e)
        }), 500
