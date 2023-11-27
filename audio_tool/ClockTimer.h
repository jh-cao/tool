#pragma once

#include <QObject>
#include <QLineEdit>
#include <QTimer>
#include <QTime>

typedef enum
{
	emClockStart,
	emClockStop,
	emClockPause,
	emClockContinue,
} EClockState;

class ClockTimer  : public QLineEdit
{
	Q_OBJECT

public:
	ClockTimer(QWidget *parent = nullptr);
	~ClockTimer();

	void startClock();
	void pauseClock();
	void continueClock();
	void stopClock();


private slots:
	void updateTimeAndDisplay();

private:
	QTimer* m_pTimer{ nullptr };
	QTime m_objShowTime{ 0,0,0, 0};
};
