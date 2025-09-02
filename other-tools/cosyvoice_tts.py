#!/usr/bin/env python
# python3 cosyvoice_tts.py input_text output_filename
# -*- coding: utf-8 -*-
"""
CosyVoice TTS with Cloned Voice - Final Working Version
Uses DashScope API for voice cloning and synthesis
"""
import os
import dashscope
from dashscope.audio.tts_v2 import SpeechSynthesizer
from dotenv import load_dotenv
import argparse

load_dotenv()

# Your cloned voice ID (generated from dashscope_voice_clone.py)
CLONED_VOICE_ID = "cosyvoice-v2-fbaijie1-05551bc6c5044dd69e5c1a98b4990641"

def synthesize_speech(text, output_file):
    """
    Convert text to speech using your cloned voice
    
    Args:
        text (str): Text to convert to speech
        output_file (str): Output audio file name
    """
    # Set API key
    dashscope.api_key = os.getenv('BAILIAN_API_KEY')
    
    if not dashscope.api_key:
        print("Error: Please set BAILIAN_API_KEY in your .env file")
        return False
    
    # Create synthesizer with your cloned voice
    synthesizer = SpeechSynthesizer(
        model="cosyvoice-v2",
        voice=CLONED_VOICE_ID,
        volume='75',
    )
    
    try:
        print(f"Converting text to speech: {text}")
        print(f"Using cloned voice: {CLONED_VOICE_ID}")
        
        # Generate speech
        audio = synthesizer.call(text)
        
        if audio:
            # Save to file
            with open(output_file, "wb") as f:
                f.write(audio)
            print(f"✅ Success! Audio saved to {output_file}")
            return True
        else:
            print("❌ No audio data received")
            return False
            
    except Exception as e:
        print(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    # Set up command line argument parsing
    parser = argparse.ArgumentParser(description="Convert text to speech using cloned voice.")
    parser.add_argument("input_text", type=str, help="Text to convert to speech")
    parser.add_argument("output_filename", type=str, help="Output audio file name")

    # Parse arguments
    args = parser.parse_args()
    
    # Call synthesize_speech with provided arguments
    synthesize_speech(args.input_text, args.output_filename)
