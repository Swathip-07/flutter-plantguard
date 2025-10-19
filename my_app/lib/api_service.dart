import 'dart:io';
import 'dart:convert';
import 'package:http/http.dart' as http;

class ApiService {
  // ⚠️ IMPORTANT:
  // Replace with your PC's *local IP address* (same Wi-Fi as your phone/emulator)
  static const String baseUrl = "http://192.168.29.9:8000";

  // 🧠 IMAGE PREDICTION ENDPOINT
  static Future<Map<String, dynamic>> predictDisease(String imagePath) async {
    try {
      var uri = Uri.parse("$baseUrl/predict");
      var request = http.MultipartRequest("POST", uri);

      // attach the image file
      request.files.add(await http.MultipartFile.fromPath('file', imagePath));

      // send request
      var response = await request.send();
      var responseBody = await response.stream.bytesToString();

      // decode JSON
      var decoded = jsonDecode(responseBody);

      // success path
      if (decoded.containsKey("prediction")) {
        return {
          "prediction": decoded["prediction"],
          "confidence": decoded["confidence"] ?? 0.0,
          "chatbot_text": decoded["chatbot_text"] ?? "",
        };
      } else {
        throw Exception("Unexpected API response: $decoded");
      }
    } catch (e) {
      print("❌ Prediction API Error: $e");
      rethrow;
    }
  }

  // 💬 CHATBOT ENDPOINT
  static Future<String> sendChatMessage(String message) async {
    try {
      var url = Uri.parse("$baseUrl/chat");
      var response = await http.post(
        url,
        headers: {"Content-Type": "application/json"},
        body: jsonEncode({"message": message}),
      );

      if (response.statusCode == 200) {
        var decoded = jsonDecode(response.body);
        return decoded["response"] ?? "No response from chatbot";
      } else {
        throw Exception("Chat request failed: ${response.statusCode}");
      }
    } catch (e) {
      print("❌ Chat API Error: $e");
      rethrow;
    }
  }
}
