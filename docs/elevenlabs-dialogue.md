# Create dialogue with timestamps

POST https://api.elevenlabs.io/v1/text-to-dialogue/with-timestamps
Content-Type: application/json

Generate dialogue from text with precise character-level timing information for audio-text synchronization.

Reference: https://elevenlabs.io/docs/api-reference/text-to-dialogue/convert-with-timestamps

## OpenAPI Specification

```yaml
openapi: 3.1.1
info:
  title: Text To Dialogue With Timestamps
  version: endpoint_textToDialogue.convert_with_timestamps
paths:
  /v1/text-to-dialogue/with-timestamps:
    post:
      operationId: convert-with-timestamps
      summary: Text To Dialogue With Timestamps
      description: >-
        Generate dialogue from text with precise character-level timing
        information for audio-text synchronization.
      tags:
        - - subpackage_textToDialogue
      parameters:
        - name: output_format
          in: query
          description: >-
            Output format of the generated audio. Formatted as
            codec_sample_rate_bitrate. So an mp3 with 22.05kHz sample rate at
            32kbs is represented as mp3_22050_32. MP3 with 192kbps bitrate
            requires you to be subscribed to Creator tier or above. PCM with
            44.1kHz sample rate requires you to be subscribed to Pro tier or
            above. Note that the μ-law format (sometimes written mu-law, often
            approximated as u-law) is commonly used for Twilio audio inputs.
          required: false
          schema:
            $ref: >-
              #/components/schemas/V1TextToDialogueWithTimestampsPostParametersOutputFormat
        - name: xi-api-key
          in: header
          required: true
          schema:
            type: string
      responses:
        '200':
          description: Successful Response
          content:
            application/json:
              schema:
                $ref: >-
                  #/components/schemas/AudioWithTimestampsAndVoiceSegmentsResponseModel
        '422':
          description: Validation Error
          content: {}
      requestBody:
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/Body_text_to_dialogue_full_with_timestamps'
components:
  schemas:
    V1TextToDialogueWithTimestampsPostParametersOutputFormat:
      type: string
      enum:
        - value: mp3_22050_32
        - value: mp3_24000_48
        - value: mp3_44100_32
        - value: mp3_44100_64
        - value: mp3_44100_96
        - value: mp3_44100_128
        - value: mp3_44100_192
        - value: pcm_8000
        - value: pcm_16000
        - value: pcm_22050
        - value: pcm_24000
        - value: pcm_32000
        - value: pcm_44100
        - value: pcm_48000
        - value: ulaw_8000
        - value: alaw_8000
        - value: opus_48000_32
        - value: opus_48000_64
        - value: opus_48000_96
        - value: opus_48000_128
        - value: opus_48000_192
    DialogueInput:
      type: object
      properties:
        text:
          type: string
        voice_id:
          type: string
      required:
        - text
        - voice_id
    ModelSettingsResponseModel:
      type: object
      properties:
        stability:
          type:
            - number
            - 'null'
          format: double
    PronunciationDictionaryVersionLocatorRequestModel:
      type: object
      properties:
        pronunciation_dictionary_id:
          type: string
        version_id:
          type:
            - string
            - 'null'
      required:
        - pronunciation_dictionary_id
    BodyTextToDialogueFullWithTimestampsApplyTextNormalization:
      type: string
      enum:
        - value: auto
        - value: 'on'
        - value: 'off'
    Body_text_to_dialogue_full_with_timestamps:
      type: object
      properties:
        inputs:
          type: array
          items:
            $ref: '#/components/schemas/DialogueInput'
        model_id:
          type: string
        language_code:
          type:
            - string
            - 'null'
        settings:
          oneOf:
            - $ref: '#/components/schemas/ModelSettingsResponseModel'
            - type: 'null'
        pronunciation_dictionary_locators:
          type:
            - array
            - 'null'
          items:
            $ref: >-
              #/components/schemas/PronunciationDictionaryVersionLocatorRequestModel
        seed:
          type:
            - integer
            - 'null'
        apply_text_normalization:
          $ref: >-
            #/components/schemas/BodyTextToDialogueFullWithTimestampsApplyTextNormalization
      required:
        - inputs
    CharacterAlignmentResponseModel:
      type: object
      properties:
        characters:
          type: array
          items:
            type: string
        character_start_times_seconds:
          type: array
          items:
            type: number
            format: double
        character_end_times_seconds:
          type: array
          items:
            type: number
            format: double
      required:
        - characters
        - character_start_times_seconds
        - character_end_times_seconds
    VoiceSegment:
      type: object
      properties:
        voice_id:
          type: string
        start_time_seconds:
          type: number
          format: double
        end_time_seconds:
          type: number
          format: double
        character_start_index:
          type: integer
        character_end_index:
          type: integer
        dialogue_input_index:
          type: integer
      required:
        - voice_id
        - start_time_seconds
        - end_time_seconds
        - character_start_index
        - character_end_index
        - dialogue_input_index
    AudioWithTimestampsAndVoiceSegmentsResponseModel:
      type: object
      properties:
        audio_base64:
          type: string
        alignment:
          oneOf:
            - $ref: '#/components/schemas/CharacterAlignmentResponseModel'
            - type: 'null'
        normalized_alignment:
          oneOf:
            - $ref: '#/components/schemas/CharacterAlignmentResponseModel'
            - type: 'null'
        voice_segments:
          type: array
          items:
            $ref: '#/components/schemas/VoiceSegment'
      required:
        - audio_base64
        - voice_segments

```

## SDK Code Examples

```typescript
import { ElevenLabsClient } from "@elevenlabs/elevenlabs-js";

async function main() {
    const client = new ElevenLabsClient({
        environment: "https://api.elevenlabs.io",
    });
    await client.textToDialogue.convertWithTimestamps({
        inputs: [
            {
                text: "string",
                voiceId: "string",
            },
        ],
    });
}
main();

```

```python
from elevenlabs import ElevenLabs

client = ElevenLabs(
    base_url="https://api.elevenlabs.io"
)

client.text_to_dialogue.convert_with_timestamps(
    inputs=[
        {
            "text": "string",
            "voice_id": "string"
        }
    ]
)

```

```go
package main

import (
	"fmt"
	"strings"
	"net/http"
	"io"
)

func main() {

	url := "https://api.elevenlabs.io/v1/text-to-dialogue/with-timestamps"

	payload := strings.NewReader("{\n  \"inputs\": [\n    {\n      \"text\": \"string\",\n      \"voice_id\": \"string\"\n    }\n  ]\n}")

	req, _ := http.NewRequest("POST", url, payload)

	req.Header.Add("xi-api-key", "xi-api-key")
	req.Header.Add("Content-Type", "application/json")

	res, _ := http.DefaultClient.Do(req)

	defer res.Body.Close()
	body, _ := io.ReadAll(res.Body)

	fmt.Println(res)
	fmt.Println(string(body))

}
```

```ruby
require 'uri'
require 'net/http'

url = URI("https://api.elevenlabs.io/v1/text-to-dialogue/with-timestamps")

http = Net::HTTP.new(url.host, url.port)
http.use_ssl = true

request = Net::HTTP::Post.new(url)
request["xi-api-key"] = 'xi-api-key'
request["Content-Type"] = 'application/json'
request.body = "{\n  \"inputs\": [\n    {\n      \"text\": \"string\",\n      \"voice_id\": \"string\"\n    }\n  ]\n}"

response = http.request(request)
puts response.read_body
```

```java
HttpResponse<String> response = Unirest.post("https://api.elevenlabs.io/v1/text-to-dialogue/with-timestamps")
  .header("xi-api-key", "xi-api-key")
  .header("Content-Type", "application/json")
  .body("{\n  \"inputs\": [\n    {\n      \"text\": \"string\",\n      \"voice_id\": \"string\"\n    }\n  ]\n}")
  .asString();
```

```php
<?php

$client = new \GuzzleHttp\Client();

$response = $client->request('POST', 'https://api.elevenlabs.io/v1/text-to-dialogue/with-timestamps', [
  'body' => '{
  "inputs": [
    {
      "text": "string",
      "voice_id": "string"
    }
  ]
}',
  'headers' => [
    'Content-Type' => 'application/json',
    'xi-api-key' => 'xi-api-key',
  ],
]);

echo $response->getBody();
```

```csharp
var client = new RestClient("https://api.elevenlabs.io/v1/text-to-dialogue/with-timestamps");
var request = new RestRequest(Method.POST);
request.AddHeader("xi-api-key", "xi-api-key");
request.AddHeader("Content-Type", "application/json");
request.AddParameter("application/json", "{\n  \"inputs\": [\n    {\n      \"text\": \"string\",\n      \"voice_id\": \"string\"\n    }\n  ]\n}", ParameterType.RequestBody);
IRestResponse response = client.Execute(request);
```

```swift
import Foundation

let headers = [
  "xi-api-key": "xi-api-key",
  "Content-Type": "application/json"
]
let parameters = ["inputs": [
    [
      "text": "string",
      "voice_id": "string"
    ]
  ]] as [String : Any]

let postData = JSONSerialization.data(withJSONObject: parameters, options: [])

let request = NSMutableURLRequest(url: NSURL(string: "https://api.elevenlabs.io/v1/text-to-dialogue/with-timestamps")! as URL,
                                        cachePolicy: .useProtocolCachePolicy,
                                    timeoutInterval: 10.0)
request.httpMethod = "POST"
request.allHTTPHeaderFields = headers
request.httpBody = postData as Data

let session = URLSession.shared
let dataTask = session.dataTask(with: request as URLRequest, completionHandler: { (data, response, error) -> Void in
  if (error != nil) {
    print(error as Any)
  } else {
    let httpResponse = response as? HTTPURLResponse
    print(httpResponse)
  }
})

dataTask.resume()
```