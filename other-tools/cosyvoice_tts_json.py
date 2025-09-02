#!/usr/bin/env python
# python3 cosyvoice_tts_json.py 1.json
# -*- coding: utf-8 -*-
"""
CosyVoice TTS with Cloned Voice - JSON batch processing
Uses DashScope API for voice cloning and synthesis
"""
import os
import json
import dashscope
from dashscope.audio.tts_v2 import SpeechSynthesizer
from dotenv import load_dotenv
import argparse

load_dotenv()

# Dictionary to map voice IDs to their corresponding values
CLONED_VOICE_IDS = {
    "1": "cosyvoice-v2-fbaijie1-05551bc6c5044dd69e5c1a98b4990641",
    "2": "cosyvoice-v2-mradio3-87de632cfd754f82af46a144ea7e10cc",
    "3": "cosyvoice-v2-faggreen1-61fb75e64a9f4b688871a8e140f4b83d",
    "4": "cosyvoice-v2-mkeda1-b9d3f6c48fa8498abb863d699b7ef915",
    # Add more voice IDs as needed
}

def synthesize_speech(text, voice_id, output_file):
    """
    Convert text to speech using the specified cloned voice

    Args:
        text (str): Text to convert to speech
        voice_id (str): Cloned voice ID to use
        output_file (str): Output audio file name
    """
    # Set API key
    dashscope.api_key = os.getenv('BAILIAN_API_KEY')

    if not dashscope.api_key:
        print("Error: Please set BAILIAN_API_KEY in your .env file")
        return False

    # Get the cloned voice value from the dictionary
    cloned_voice = CLONED_VOICE_IDS.get(voice_id)
    if not cloned_voice:
        print(f"Error: Invalid voice ID {voice_id}")
        return False

    # Create synthesizer with the specified cloned voice
    synthesizer = SpeechSynthesizer(
        model="cosyvoice-v2",
        voice=cloned_voice,
        volume='75',
    )

    try:
        print(f"Converting text to speech: {text}")
        print(f"Using cloned voice: {cloned_voice}")

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
    parser = argparse.ArgumentParser(description="Convert JSON text entries to speech using cloned voices.")
    parser.add_argument("json_file", type=str, help="Path to JSON file containing numbered text entries with voice IDs")

    # Parse arguments
    args = parser.parse_args()

    # Load JSON
    try:
        with open(args.json_file, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        print(f"❌ Failed to read JSON file: {e}")
        exit(1)

    # Process entries in sorted order of keys
    for key in sorted(data.keys(), key=lambda x: int(x)):
        voice_id, text = data[key]
        output_filename = f"{key}.mp3"
        synthesize_speech(text, voice_id, output_filename)
