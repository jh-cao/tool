#include "ClockTimer.h"

#include <QDebug>

ClockTimer::ClockTimer(QWidget *parent)
	: QLineEdit(parent)
{
	m_pTimer = new QTimer(this);
	setText(m_objShowTime.toString("hh:mm:ss"));
	connect(m_pTimer, &QTimer::timeout, this, &ClockTimer::updateTimeAndDisplay);
}

ClockTimer::~ClockTimer()
{
	m_pTimer->deleteLater();
}

void ClockTimer::startClock()
{
	qDebug() << "start";
	m_objShowTime = QTime(0, 0, 0, 0);
	// 一秒增加一次
	m_pTimer->start(1000);
}

void ClockTimer::pauseClock()
{
	m_pTimer->stop();
}


void ClockTimer::continueClock()
{
	m_pTimer->start(1000);
}

void ClockTimer::stopClock()
{
	m_pTimer->stop();
}

void ClockTimer::updateTimeAndDisplay()
{
	m_objShowTime = m_objShowTime.addSecs(1);
	QString str = m_objShowTime.toString("hh:mm:ss");
	setText(str);
}

