import 'dart:io';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:image_picker/image_picker.dart';
import 'dart:convert';
import 'package:http/http.dart' as http;
import 'api_service.dart';

void main() {
  runApp(PlantGuardApp());
}

class PlantGuardApp extends StatelessWidget {
  PlantGuardApp({super.key});

  final GoRouter _router = GoRouter(
    initialLocation: '/',
    routes: <RouteBase>[
      GoRoute(path: '/', builder: (context, state) => const IndexScreen()),
      GoRoute(path: '/language-selection', builder: (context, state) => const LanguageSelectionScreen()),
      GoRoute(path: '/user-registration', builder: (context, state) => const UserRegistrationScreen()),
      GoRoute(path: '/crop-selection', builder: (context, state) => const CropSelectionScreen()),
      GoRoute(path: '/main-dashboard', builder: (context, state) => const MainDashboardScreen()),
      GoRoute(path: '/disease-detection', builder: (context, state) => const DiseaseDetectionScreen()),
      GoRoute(path: '/treatment-results', builder: (context, state) => const TreatmentResultsScreen()),
      GoRoute(path: '/market-prices', builder: (context, state) => const MarketPricesScreen()),
      GoRoute(path: '/chatbot', builder: (context, state) => ChatbotHomePage()),
    ],
  );

  @override
  Widget build(BuildContext context) {
    return MaterialApp.router(
      title: 'PlantGuard',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primarySwatch: Colors.green,
        useMaterial3: true,
      ),
      routerConfig: _router,
    );
  }
}

// -------------------------------------------------------------
// 1️⃣ WELCOME SCREEN
// -------------------------------------------------------------
class IndexScreen extends StatelessWidget {
  const IndexScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.green.shade50,
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(Icons.eco, color: Colors.green.shade700, size: 90),
              const SizedBox(height: 20),
              Text(
                'Welcome to the World of PlantGuard',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: Colors.green.shade800,
                ),
              ),
              const SizedBox(height: 40),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.green.shade600,
                  padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 14),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                ),
                onPressed: () {
                  context.push('/language-selection');
                },
                child: const Text('Get Started', style: TextStyle(fontSize: 18, color: Colors.white)),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// 2️⃣ LANGUAGE SELECTION SCREEN
// -------------------------------------------------------------
class LanguageSelectionScreen extends StatefulWidget {
  const LanguageSelectionScreen({super.key});

  @override
  _LanguageSelectionScreenState createState() => _LanguageSelectionScreenState();
}

class _LanguageSelectionScreenState extends State<LanguageSelectionScreen> {
  String? selectedLanguage;
  final FlutterSecureStorage _storage = const FlutterSecureStorage();

  void _continue() async {
    if (selectedLanguage == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a language')),
      );
      return;
    }

    await _storage.write(key: 'selectedLanguage', value: selectedLanguage);
    if (context.mounted) {
      context.push('/user-registration');
    }
  }

  @override
  Widget build(BuildContext context) {
    final languages = ['English', 'Hindi', 'Telugu', 'Kannada', 'Tamil'];

    return Scaffold(
      appBar: AppBar(title: const Text('Select Language'), backgroundColor: Colors.green),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            const Text(
              'Choose Your Preferred Language',
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 30),
            ...languages.map((lang) {
              return RadioListTile<String>(
                title: Text(lang),
                value: lang,
                groupValue: selectedLanguage,
                onChanged: (value) {
                  setState(() => selectedLanguage = value);
                },
                activeColor: Colors.green,
              );
            }),
            const SizedBox(height: 30),
            ElevatedButton(
              onPressed: _continue,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                padding: const EdgeInsets.symmetric(horizontal: 40, vertical: 14),
              ),
              child: const Text('Continue', style: TextStyle(fontSize: 18, color: Colors.white)),
            ),
          ],
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// 3️⃣ USER REGISTRATION SCREEN
// -------------------------------------------------------------
class UserRegistrationScreen extends StatefulWidget {
  const UserRegistrationScreen({super.key});

  @override
  _UserRegistrationScreenState createState() => _UserRegistrationScreenState();
}

class _UserRegistrationScreenState extends State<UserRegistrationScreen> {
  final _phoneController = TextEditingController();
  final _otpController = TextEditingController();
  bool otpSent = false;

  void _sendOtp() {
    if (_phoneController.text.length == 10) {
      setState(() => otpSent = true);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Sample OTP sent successfully! (1234)")),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Enter a valid 10-digit phone number")),
      );
    }
  }

  void _verifyOtp() {
    if (_otpController.text == "1234") {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Registration successful!")),
      );
      context.push('/crop-selection');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text("Invalid OTP! Try 1234")),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("User Registration"), backgroundColor: Colors.green),
      body: Padding(
        padding: const EdgeInsets.all(24.0),
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            TextField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: const InputDecoration(
                labelText: "Phone Number",
                border: OutlineInputBorder(),
                prefixIcon: Icon(Icons.phone),
              ),
            ),
            const SizedBox(height: 20),
            if (otpSent)
              TextField(
                controller: _otpController,
                keyboardType: TextInputType.number,
                decoration: const InputDecoration(
                  labelText: "Enter OTP (sample: 1234)",
                  border: OutlineInputBorder(),
                  prefixIcon: Icon(Icons.lock),
                ),
              ),
            const SizedBox(height: 20),
            ElevatedButton(
              onPressed: otpSent ? _verifyOtp : _sendOtp,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                minimumSize: const Size(double.infinity, 50),
              ),
              child: Text(
                otpSent ? "Verify OTP" : "Send OTP",
                style: const TextStyle(fontSize: 18, color: Colors.white),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// 4️⃣ SELECT CROPS SCREEN
// -------------------------------------------------------------
class CropSelectionScreen extends StatefulWidget {
  const CropSelectionScreen({super.key});

  @override
  State<CropSelectionScreen> createState() => _CropSelectionScreenState();
}

class _CropSelectionScreenState extends State<CropSelectionScreen> {
  final List<String> crops = ['Tomato', 'Potato', 'Onion'];
  final Set<String> selectedCrops = {};

  void _toggleCrop(String crop) {
    setState(() {
      if (selectedCrops.contains(crop)) {
        selectedCrops.remove(crop);
      } else {
        selectedCrops.add(crop);
      }
    });
  }

  void _continue() {
    if (selectedCrops.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select at least one crop')),
      );
      return;
    }
    context.go('/main-dashboard');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text("Select Your Crops"), backgroundColor: Colors.green),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const Text(
              "Select the crops you cultivate",
              style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 20),
            Expanded(
              child: GridView.builder(
                gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                  crossAxisCount: 2,
                  crossAxisSpacing: 12,
                  mainAxisSpacing: 12,
                  childAspectRatio: 1.1,
                ),
                itemCount: crops.length,
                itemBuilder: (context, index) {
                  final crop = crops[index];
                  final selected = selectedCrops.contains(crop);
                  return InkWell(
                    onTap: () => _toggleCrop(crop),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: selected ? Colors.green : Colors.white,
                        border: Border.all(color: Colors.green, width: 2),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Center(
                        child: Text(
                          crop,
                          style: TextStyle(
                            fontSize: 18,
                            color: selected ? Colors.white : Colors.green.shade900,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                      ),
                    ),
                  );
                },
              ),
            ),
            ElevatedButton(
              onPressed: _continue,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.green,
                minimumSize: const Size(double.infinity, 50),
              ),
              child: const Text("Continue", style: TextStyle(color: Colors.white, fontSize: 18)),
            ),
          ],
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// 5️⃣ MAIN DASHBOARD
// -------------------------------------------------------------
class MainDashboardScreen extends StatelessWidget {
  const MainDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Main Dashboard'), backgroundColor: Colors.green),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            const Text('Welcome to PlantGuard', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
            const SizedBox(height: 24),
            Wrap(
              spacing: 12,
              runSpacing: 12,
              children: [
                _DashboardCard(
                  title: 'Disease Detection',
                  icon: Icons.biotech,
                  onTap: () => context.push('/disease-detection'),
                ),
                _DashboardCard(
                  title: 'Chatbot',
                  icon: Icons.chat,
                  onTap: () => context.push('/chatbot'),
                ),
                _DashboardCard(
                  title: 'Market Prices',
                  icon: Icons.store,
                  onTap: () => context.push('/market-prices'),
                ),
                _DashboardCard(
                  title: 'Treatment Results',
                  icon: Icons.local_hospital,
                  onTap: () => context.push('/treatment-results'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _DashboardCard extends StatelessWidget {
  final String title;
  final IconData icon;
  final VoidCallback onTap;
  const _DashboardCard({required this.title, required this.icon, required this.onTap, super.key});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: 160,
      height: 120,
      child: Card(
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        elevation: 3,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(12),
          child: Padding(
            padding: const EdgeInsets.all(16.0),
            child: Column(mainAxisAlignment: MainAxisAlignment.center, children: [
              Icon(icon, size: 36, color: Colors.green),
              const SizedBox(height: 8),
              Text(title, textAlign: TextAlign.center, style: const TextStyle(fontWeight: FontWeight.bold)),
            ]),
          ),
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// 6️⃣ DISEASE DETECTION
// -------------------------------------------------------------
class DiseaseDetectionScreen extends StatefulWidget {
  const DiseaseDetectionScreen({super.key});

  @override
  State<DiseaseDetectionScreen> createState() => _DiseaseDetectionScreenState();
}

class _DiseaseDetectionScreenState extends State<DiseaseDetectionScreen> {
  String? selectedImagePath;
  String? predictedLabel;
  String? chatbotText;
  bool isLoading = false;

  Future<void> _pickImage(bool fromCamera) async {
    final picker = ImagePicker();
    final XFile? file = await (fromCamera
        ? picker.pickImage(source: ImageSource.camera, imageQuality: 85)
        : picker.pickImage(source: ImageSource.gallery, imageQuality: 85));
    if (file == null) return;
    setState(() {
      selectedImagePath = file.path;
      predictedLabel = null;
      chatbotText = null;
    });
  }

  Future<void> _runPipeline() async {
    if (selectedImagePath == null) return;
    setState(() {
      isLoading = true;
      predictedLabel = null;
      chatbotText = null;
    });

    try {
      final result = await ApiService.predictDisease(selectedImagePath!);
      if (!mounted) return;
      setState(() {
        predictedLabel = result['prediction'] as String?;
        chatbotText = result['chatbot_text'] as String?;
        isLoading = false;
      });
    } catch (e) {
      if (!mounted) return;
      setState(() => isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Error: $e')),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Disease Detection'), backgroundColor: Colors.green),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceEvenly,
              children: [
                ElevatedButton.icon(
                  onPressed: () => _pickImage(true),
                  icon: const Icon(Icons.camera_alt),
                  label: const Text('Camera'),
                ),
                ElevatedButton.icon(
                  onPressed: () => _pickImage(false),
                  icon: const Icon(Icons.photo_library),
                  label: const Text('Gallery'),
                ),
              ],
            ),
            const SizedBox(height: 16),
            if (selectedImagePath != null)
              Container(
                height: 220,
                decoration: BoxDecoration(
                  border: Border.all(color: Colors.green, width: 2),
                  borderRadius: BorderRadius.circular(12),
                ),
                clipBehavior: Clip.antiAlias,
                child: Image.file(File(selectedImagePath!), fit: BoxFit.cover),
              ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              child: ElevatedButton(
                onPressed: isLoading || selectedImagePath == null ? null : _runPipeline,
                child: isLoading
                    ? const SizedBox(
                        width: 20,
                        height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white),
                      )
                    : const Text('Detect Disease'),
              ),
            ),
            const SizedBox(height: 16),
            if (predictedLabel != null)
              Align(
                alignment: Alignment.centerLeft,
                child: Text(
                  'Prediction: $predictedLabel',
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              ),
            const SizedBox(height: 8),
            Expanded(
              child: Container(
                width: double.infinity,
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: Colors.green[50],
                  border: Border.all(color: Colors.green, width: 1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: SingleChildScrollView(
                  child: Text(
                    chatbotText ?? 'Guidance will appear here after detection.',
                    style: const TextStyle(fontSize: 16),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// -------------------------------------------------------------
// 7️⃣ TREATMENT RESULTS
// -------------------------------------------------------------
class TreatmentResultsScreen extends StatelessWidget {
  const TreatmentResultsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Treatment Results'), backgroundColor: Colors.green),
      body: const Center(child: Text('Show treatment recommendations here')),
    );
  }
}

// -------------------------------------------------------------
// 8️⃣ MARKET PRICES
// -------------------------------------------------------------
class MarketPricesScreen extends StatelessWidget {
  const MarketPricesScreen({super.key});

  final List<Map<String, String>> samplePrices = const [
    {'crop': 'Tomato', 'price': '₹20/kg'},
    {'crop': 'Potato', 'price': '₹18/kg'},
    {'crop': 'Onion', 'price': '₹22/kg'},
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Market Prices'), backgroundColor: Colors.green),
      body: ListView.builder(
        padding: const EdgeInsets.all(12),
        itemCount: samplePrices.length,
        itemBuilder: (context, index) {
          final item = samplePrices[index];
          return Card(
            child: ListTile(
              leading: const Icon(Icons.local_grocery_store),
              title: Text(item['crop']!),
                            trailing: Text(item['price']!, style: const TextStyle(fontWeight: FontWeight.bold)),
            ),
          );
        },
      ),
    );
  }
}

// -------------------------------------------------------------
// 9️⃣ CHATBOT PAGE
// -------------------------------------------------------------
class ChatbotHomePage extends StatefulWidget {
  const ChatbotHomePage({super.key});

  @override
  State<ChatbotHomePage> createState() => _ChatbotHomePageState();
}

class _ChatbotHomePageState extends State<ChatbotHomePage> {
  final TextEditingController _controller = TextEditingController();
  final List<Map<String, String>> _messages = [];
  bool _isLoading = false;

  Future<void> _sendMessage() async {
    final text = _controller.text.trim();
    if (text.isEmpty) return;

    setState(() {
      _messages.add({'sender': 'user', 'text': text});
      _controller.clear();
      _isLoading = true;
    });

    try {
      final response = await ApiService.sendChatMessage(text);
      setState(() {
        _messages.add({'sender': 'bot', 'text': response});
      });
    } catch (e) {
      setState(() {
        _messages.add({'sender': 'bot', 'text': 'Error: $e'});
      });
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Widget _buildMessage(Map<String, String> message) {
    final isUser = message['sender'] == 'user';
    return Align(
      alignment: isUser ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.symmetric(vertical: 6, horizontal: 8),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: isUser ? Colors.green[100] : Colors.grey[200],
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          message['text']!,
          style: TextStyle(
            color: isUser ? Colors.green.shade900 : Colors.black87,
            fontSize: 16,
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Tomato Chatbot'),
        backgroundColor: Colors.green,
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.all(8),
              itemCount: _messages.length,
              itemBuilder: (context, index) {
                return _buildMessage(_messages[index]);
              },
            ),
          ),
          if (_isLoading)
            const Padding(
              padding: EdgeInsets.all(8),
              child: CircularProgressIndicator(color: Colors.green),
            ),
          const Divider(height: 1),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 6),
            color: Colors.white,
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _controller,
                    textInputAction: TextInputAction.send,
                    onSubmitted: (_) => _sendMessage(),
                    decoration: const InputDecoration.collapsed(
                      hintText: "Ask me anything about tomato diseases...",
                    ),
                  ),
                ),
                IconButton(
                  icon: const Icon(Icons.send, color: Colors.green),
                  onPressed: _isLoading ? null : _sendMessage,
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
