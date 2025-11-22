import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:fl_chart/fl_chart.dart';
import 'package:intl/intl.dart';
import '../../models/checkin.dart';
import '../../services/api_service.dart';
import '../../providers/auth_provider.dart';

/// Profile screen with points history and analytics
class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  final ApiService _apiService = ApiService();
  List<CheckIn> _checkIns = [];
  bool _isLoading = true;
  String? _error;

  @override
  void initState() {
    super.initState();
    _loadCheckIns();
  }

  Future<void> _loadCheckIns() async {
    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final checkIns = await _apiService.getMyCheckIns(limit: 100);
      setState(() {
        _checkIns = checkIns;
        _isLoading = false;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '');
        _isLoading = false;
      });
    }
  }

  Map<String, int> _getCheckInsByDay() {
    final Map<String, int> checkInsByDay = {};
    final now = DateTime.now();
    final last7Days = now.subtract(const Duration(days: 6));

    // Initialize with 0 for all days
    for (int i = 0; i < 7; i++) {
      final date = last7Days.add(Duration(days: i));
      final key = DateFormat('E').format(date);
      checkInsByDay[key] = 0;
    }

    // Count check-ins
    for (final checkIn in _checkIns) {
      if (checkIn.timestamp.isAfter(last7Days)) {
        final key = DateFormat('E').format(checkIn.timestamp);
        checkInsByDay[key] = (checkInsByDay[key] ?? 0) + 1;
      }
    }

    return checkInsByDay;
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().user;
    final authProvider = context.read<AuthProvider>();

    return Scaffold(
      appBar: AppBar(
        title: const Text('Profile'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: () async {
              final confirmed = await showDialog<bool>(
                context: context,
                builder: (context) => AlertDialog(
                  title: const Text('Logout'),
                  content: const Text('Are you sure you want to logout?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(context, false),
                      child: const Text('Cancel'),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(context, true),
                      child: const Text('Logout'),
                    ),
                  ],
                ),
              );

              if (confirmed == true && context.mounted) {
                await authProvider.logout();
              }
            },
          ),
        ],
      ),
      body: _isLoading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadCheckIns,
              child: SingleChildScrollView(
                physics: const AlwaysScrollableScrollPhysics(),
                padding: const EdgeInsets.all(16),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    // User info card
                    if (user != null) ...[
                      Card(
                        elevation: 2,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(16),
                        ),
                        child: Padding(
                          padding: const EdgeInsets.all(20),
                          child: Row(
                            children: [
                              CircleAvatar(
                                radius: 32,
                                backgroundColor: Colors.blue.shade100,
                                child: Text(
                                  user.name[0].toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 32,
                                    fontWeight: FontWeight.bold,
                                    color: Colors.blue.shade700,
                                  ),
                                ),
                              ),
                              const SizedBox(width: 16),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment: CrossAxisAlignment.start,
                                  children: [
                                    Text(
                                      user.name,
                                      style: const TextStyle(
                                        fontSize: 20,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      user.email,
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: Colors.grey.shade600,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                      const SizedBox(height: 24),

                      // Stats cards
                      Row(
                        children: [
                          Expanded(
                            child: _StatCard(
                              icon: Icons.stars,
                              label: 'Total Points',
                              value: user.points.toString(),
                              color: Colors.amber,
                            ),
                          ),
                          const SizedBox(width: 12),
                          Expanded(
                            child: _StatCard(
                              icon: Icons.check_circle,
                              label: 'Check-ins',
                              value: _checkIns.length.toString(),
                              color: Colors.green,
                            ),
                          ),
                        ],
                      ),
                      const SizedBox(height: 24),
                    ],

                    // Chart
                    Text(
                      'Activity (Last 7 Days)',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 16),
                    Card(
                      elevation: 2,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Padding(
                        padding: const EdgeInsets.all(20),
                        child: SizedBox(
                          height: 200,
                          child: _CheckInChart(
                            checkInsByDay: _getCheckInsByDay(),
                          ),
                        ),
                      ),
                    ),
                    const SizedBox(height: 24),

                    // Recent check-ins
                    Text(
                      'Recent Check-ins',
                      style: Theme.of(context).textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                    ),
                    const SizedBox(height: 16),
                    _checkIns.isEmpty
                        ? Card(
                            elevation: 2,
                            child: Padding(
                              padding: const EdgeInsets.all(32),
                              child: Center(
                                child: Column(
                                  children: [
                                    Icon(
                                      Icons.inbox_outlined,
                                      size: 48,
                                      color: Colors.grey.shade400,
                                    ),
                                    const SizedBox(height: 8),
                                    Text(
                                      'No check-ins yet',
                                      style: TextStyle(
                                        color: Colors.grey.shade600,
                                        fontSize: 16,
                                      ),
                                    ),
                                  ],
                                ),
                              ),
                            ),
                          )
                        : ListView.separated(
                            shrinkWrap: true,
                            physics: const NeverScrollableScrollPhysics(),
                            itemCount: _checkIns.take(10).length,
                            separatorBuilder: (context, index) =>
                                const SizedBox(height: 8),
                            itemBuilder: (context, index) {
                              final checkIn = _checkIns[index];
                              return _CheckInListItem(checkIn: checkIn);
                            },
                          ),
                  ],
                ),
              ),
            ),
    );
  }
}

class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 2,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(16),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            Icon(icon, size: 32, color: color),
            const SizedBox(height: 8),
            Text(
              value,
              style: const TextStyle(
                fontSize: 24,
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              label,
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey.shade600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _CheckInChart extends StatelessWidget {
  final Map<String, int> checkInsByDay;

  const _CheckInChart({required this.checkInsByDay});

  @override
  Widget build(BuildContext context) {
    final entries = checkInsByDay.entries.toList();
    final maxY = entries.map((e) => e.value).reduce((a, b) => a > b ? a : b);

    return BarChart(
      BarChartData(
        alignment: BarChartAlignment.spaceAround,
        maxY: maxY > 0 ? maxY.toDouble() + 1 : 5,
        barTouchData: BarTouchData(enabled: false),
        titlesData: FlTitlesData(
          show: true,
          bottomTitles: AxisTitles(
            sideTitles: SideTitles(
              showTitles: true,
              getTitlesWidget: (value, meta) {
                if (value.toInt() >= 0 && value.toInt() < entries.length) {
                  return Padding(
                    padding: const EdgeInsets.only(top: 8),
                    child: Text(
                      entries[value.toInt()].key,
                      style: const TextStyle(fontSize: 12),
                    ),
                  );
                }
                return const Text('');
              },
            ),
          ),
          leftTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          topTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
          rightTitles: const AxisTitles(
            sideTitles: SideTitles(showTitles: false),
          ),
        ),
        borderData: FlBorderData(show: false),
        gridData: const FlGridData(show: false),
        barGroups: List.generate(
          entries.length,
          (index) => BarChartGroupData(
            x: index,
            barRods: [
              BarChartRodData(
                toY: entries[index].value.toDouble(),
                color: Colors.blue,
                width: 20,
                borderRadius: const BorderRadius.vertical(
                  top: Radius.circular(4),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _CheckInListItem extends StatelessWidget {
  final CheckIn checkIn;

  const _CheckInListItem({required this.checkIn});

  String _formatDate(DateTime date) {
    final now = DateTime.now();
    final difference = now.difference(date);

    if (difference.inDays == 0) {
      return 'Today at ${DateFormat('h:mm a').format(date)}';
    } else if (difference.inDays == 1) {
      return 'Yesterday at ${DateFormat('h:mm a').format(date)}';
    } else if (difference.inDays < 7) {
      return DateFormat('EEEE \'at\' h:mm a').format(date);
    } else {
      return DateFormat('MMM d \'at\' h:mm a').format(date);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      elevation: 1,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
      ),
      child: ListTile(
        leading: CircleAvatar(
          backgroundColor: Colors.green.shade100,
          child: Text(
            checkIn.cardLogo ?? '🎫',
            style: const TextStyle(fontSize: 20),
          ),
        ),
        title: Text(
          checkIn.cardName ?? 'Unknown Card',
          style: const TextStyle(fontWeight: FontWeight.w600),
        ),
        subtitle: Text(_formatDate(checkIn.timestamp)),
        trailing: Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: Colors.amber.shade100,
            borderRadius: BorderRadius.circular(12),
          ),
          child: Text(
            '+${checkIn.pointsEarned}',
            style: TextStyle(
              color: Colors.amber.shade900,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ),
    );
  }
}
