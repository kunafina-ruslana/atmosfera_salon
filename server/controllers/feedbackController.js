import Feedback from '../models/Feedback.js';

export const createFeedback = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    
    const feedback = await Feedback.create({
      name,
      email,
      message,
      isModerated: false
    });
    
    res.status(201).json({ message: 'Сообщение отправлено на модерацию', feedback });
  } catch (error) {
    console.error('Ошибка создания сообщения:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      where: { isModerated: true },
      order: [['createdAt', 'DESC']]
    });
    res.json(feedbacks);
  } catch (error) {
    console.error('Ошибка получения сообщений:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllFeedbacks = async (req, res) => {
  try {
    const feedbacks = await Feedback.findAll({
      order: [['createdAt', 'DESC']]
    });
    res.json(feedbacks);
  } catch (error) {
    console.error('Ошибка получения всех сообщений:', error);
    res.status(500).json({ error: error.message });
  }
};

export const moderateFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }
    
    feedback.isModerated = true;
    await feedback.save();
    res.json(feedback);
  } catch (error) {
    console.error('Ошибка модерации сообщения:', error);
    res.status(500).json({ error: error.message });
  }
};

export const deleteFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findByPk(req.params.id);
    if (!feedback) {
      return res.status(404).json({ error: 'Сообщение не найдено' });
    }
    
    await feedback.destroy();
    res.status(204).send();
  } catch (error) {
    console.error('Ошибка удаления сообщения:', error);
    res.status(500).json({ error: error.message });
  }
};