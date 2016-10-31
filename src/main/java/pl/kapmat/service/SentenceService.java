package pl.kapmat.service;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import pl.kapmat.dao.SentenceDAO;
import pl.kapmat.model.Language;
import pl.kapmat.model.Sentence;
import pl.kapmat.util.FileOperator;

import java.util.List;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

/**
 * Sentence service
 *
 * @author Mateusz Kaproń
 */
@Service
public class SentenceService {

	@Autowired
	private SentenceDAO sentenceDAO;

//	public void setDAO(SentenceDAO sentenceDAO) {
//		this.sentenceDAO = sentenceDAO;
//	}

	private void insertSentencesIntoDatabase(List<Sentence> sentences) {
		sentenceDAO.save(sentences);
	}

	public List<Sentence> getAllSentences() {
		return (List<Sentence>) sentenceDAO.findAll();
	}

	public void deleteAllSentences() {
		sentenceDAO.deleteAll();
	}

	public void insertSentences(String path, Language lang) {
		insertSentencesIntoDatabase(getSentencesAfterCorrection(path, lang));
	}

	public List<Sentence> getSentencesAfterCorrection(String path, Language lang) {
		FileOperator fileOperator = new FileOperator();
		List<Sentence> sentenceList = fileOperator.getSentencesFromTxt(path, lang);

		sentenceList = deleteLastCharacter(sentenceList);
		sentenceList = deleteSentencePartBeforeChar(sentenceList, '\t');
		return sentenceList;
	}

	public List<Sentence> deleteChars(List<Sentence> sentences, char[] charsToDelete) {
		for (char character: charsToDelete) {
			sentences = replaceCharacter(sentences, character, ' ');
		}
		return sentences;
	}

	public List<Sentence> replaceCharacter(List<Sentence> sentences, char oldChar, char newChar) {
		List<String> sentencesList = sentences.stream()
				.map(s -> s.getText().replace(oldChar, newChar))
				.collect(Collectors.toList());
		return IntStream.range(0, sentences.size())
				.mapToObj(i -> new Sentence(sentencesList.get(i), sentences.get(0).getLanguage()))
				.collect(Collectors.toList());
	}

	public List<Sentence> deleteSentencePartBeforeChar(List<Sentence> sentences, char startChar) {
		List<String> sentencesList = sentences.stream()
				.map(s -> s.getText().substring(s.getText().indexOf(startChar)+1))
				.collect(Collectors.toList());
		return IntStream.range(0, sentences.size())
				.mapToObj(i -> new Sentence(sentencesList.get(i), sentences.get(0).getLanguage()))
				.collect(Collectors.toList());
	}

	public List<Sentence> deleteLastCharacter(List<Sentence> sentences) {
		List<String> sentencesList = sentences.stream()
				.map(s -> s.getText().substring(0, s.getText().length()-1))
				.collect(Collectors.toList());
		return IntStream.range(0, sentences.size())
				.mapToObj(i -> new Sentence(sentencesList.get(i), sentences.get(0).getLanguage()))
				.collect(Collectors.toList());
	}
}
