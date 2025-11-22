import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../models/card.dart';
import '../../services/api_service.dart';
import '../../providers/auth_provider.dart';
import 'package:intl/intl.dart';

/// Card detail screen with check-in functionality
class CardDetailScreen extends StatefulWidget {
  final UserCard userCard;
  final CardModel card;

  const CardDetailScreen({
    super.key,
    required this.userCard,
    required this.card,
  });

  @override
  State<CardDetailScreen> createState() => _CardDetailScreenState();
}

class _CardDetailScreenState extends State<CardDetailScreen>
    with SingleTickerProviderStateMixin {
  final ApiService _apiService = ApiService();
  bool _isCheckingIn = false;
  late AnimationController _animationController;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _animationController = AnimationController(
      duration: const Duration(milliseconds: 200),
      vsync: this,
    );
    _scaleAnimation = Tween<double>(begin: 1.0, end: 0.95).animate(
      CurvedAnimation(parent: _animationController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _animationController.dispose();
    super.dispose();
  }

  Color _parseColor(String? colorString) {
    if (colorString == null) return Colors.blue;
    try {
      return Color(int.parse(colorString.substring(1), radix: 16) + 0xFF000000);
    } catch (e) {
      return Colors.blue;
    }
  }

  Future<void> _handleCheckIn() async {
    if (_isCheckingIn) return;

    setState(() {
      _isCheckingIn = true;
    });

    _animationController.forward().then((_) => _animationController.reverse());

    try {
      final response = await _apiService.checkIn(cardId: widget.card.id);

      if (!mounted) return;

      // Update user points in provider
      context.read<AuthProvider>().updatePoints(response.totalPoints);

      // Show success message
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(Icons.check_circle, color: Colors.white),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    const Text(
                      'Check-in successful!',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Text('You earned ${response.checkIn.pointsEarned} points'),
                  ],
                ),
              ),
            ],
          ),
          backgroundColor: Colors.green,
          duration: const Duration(seconds: 3),
          behavior: SnackBarBehavior.floating,
        ),
      );

      // Return true to indicate refresh needed
      Navigator.pop(context, true);
    } catch (e) {
      if (!mounted) return;

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(e.toString().replaceAll('Exception: ', '')),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) {
        setState(() {
          _isCheckingIn = false;
        });
      }
    }
  }

  String _formatDateTime(DateTime? date) {
    if (date == null) return 'Never';
    return DateFormat('MMM d, y \'at\' h:mm a').format(date);
  }

  @override
  Widget build(BuildContext context) {
    final cardColor = _parseColor(widget.card.backgroundColor);

    return Scaffold(
      appBar: AppBar(
        title: Text(widget.card.name),
        backgroundColor: cardColor,
      ),
      body: Column(
        children: [
          // Card visual
          Container(
            width: double.infinity,
            height: 220,
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: LinearGradient(
                colors: [cardColor, cardColor.withOpacity(0.7)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: cardColor.withOpacity(0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Padding(
              padding: const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        widget.card.logo ?? '🎫',
                        style: const TextStyle(fontSize: 48),
                      ),
                      Icon(
                        Icons.qr_code,
                        color: Colors.white.withOpacity(0.5),
                        size: 48,
                      ),
                    ],
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        widget.card.name,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 24,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      if (widget.card.description != null) ...[
                        const SizedBox(height: 8),
                        Text(
                          widget.card.description!,
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.9),
                            fontSize: 14,
                          ),
                        ),
                      ],
                    ],
                  ),
                ],
              ),
            ),
          ),

          // Card details
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _InfoCard(
                    icon: Icons.access_time,
                    title: 'Last Check-in',
                    value: _formatDateTime(widget.userCard.lastCheckIn),
                  ),
                  const SizedBox(height: 12),
                  _InfoCard(
                    icon: Icons.calendar_today,
                    title: 'Added to Wallet',
                    value: _formatDateTime(widget.userCard.addedAt),
                  ),
                  const SizedBox(height: 12),
                  _InfoCard(
                    icon: Icons.info_outline,
                    title: 'Card ID',
                    value: widget.card.id,
                    isMonospace: true,
                  ),
                  const SizedBox(height: 24),

                  // Future feature placeholder
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: Colors.blue.shade50,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: Colors.blue.shade200),
                    ),
                    child: Row(
                      children: [
                        Icon(Icons.lightbulb_outline,
                            color: Colors.blue.shade700),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Text(
                            'Future: NFC/QR code scanning will be available here',
                            style: TextStyle(
                              color: Colors.blue.shade700,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // Check-in button
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: ScaleTransition(
                scale: _scaleAnimation,
                child: SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _isCheckingIn ? null : _handleCheckIn,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: cardColor,
                      foregroundColor: Colors.white,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      elevation: 4,
                    ),
                    child: _isCheckingIn
                        ? const SizedBox(
                            height: 24,
                            width: 24,
                            child: CircularProgressIndicator(
                              color: Colors.white,
                              strokeWidth: 2,
                            ),
                          )
                        : const Row(
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Icon(Icons.check_circle, size: 24),
                              SizedBox(width: 8),
                              Text(
                                'Check In',
                                style: TextStyle(
                                  fontSize: 18,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _InfoCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;
  final bool isMonospace;

  const _InfoCard({
    required this.icon,
    required this.title,
    required this.value,
    this.isMonospace = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.grey.shade100,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.grey.shade700, size: 24),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    color: Colors.grey.shade600,
                    fontSize: 12,
                    fontWeight: FontWeight.w500,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  value,
                  style: TextStyle(
                    color: Colors.grey.shade900,
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    fontFamily: isMonospace ? 'monospace' : null,
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
