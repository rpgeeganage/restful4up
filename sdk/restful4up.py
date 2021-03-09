#!/usr/bin/python3

import requests
from os.path import isdir, isfile, join, basename
import logging
from time import sleep
import sys
import json

class restful4up():

	def __init__(self, HOST = None):
		self.API_HOST = f'{HOST}/v1'
		self.RATE_LIMIT = 5
		if self.API_HOST is None:
			raise ValueError('Please provide the API HOST')

	def unpack(self, path):
		"""Run /unpack. To unpack the uploaded the executable

		Args:
			path (string): path to the executable

		Raises:
			ValueError: HTTPError
			ValueError: Timeout
			ValueError: RequestException

		Returns:
			string: Binary string of the unpacked file
		"""
		return self.uploadAndGetOutput(path, 'unpack')

	def emulationOutput(self, path):
		"""Run /emulation-output. To get the output of Unipacker during the unpack process

		Args:
			path (string): path to the executable

		Raises:
			ValueError: HTTPError
			ValueError: Timeout
			ValueError: RequestException

		Returns:
			string[]: Output from the Unipacker during the unpacking process
		"""
		return self.uploadAndGetOutput(path, 'emulation-output')

	def clean(self):
		"""Run /clean. To cleanup the uploaded executables.

		Raises:
			ValueError: HTTPError
			ValueError: Timeout
			ValueError: RequestException
		"""
		try:
			response = requests.head(f'{self.API_HOST}/clean')
			response.raise_for_status()
		except requests.exceptions.HTTPError as err:
			raise ValueError(err.response.message)
		except requests.exceptions.Timeout:
			raise ValueError('timed out')
		except requests.exceptions.RequestException as err:
			raise ValueError(err)

	def generatePartialYaraRule(self, path, is_unpacking_required=False, minimum_string_length=4, strings_to_ignore=[]):
		"""Run /generate-partial-yara-rules. To generate partial YARA rule.

		Args:
			path (string): path to the executable
			is_unpacking_required (bool, optional): Defaults to False.
			minimum_string_length (int, optional): Defaults to 4.
			strings_to_ignore (list, optional): Defaults to [].

		Raises:
			ValueError: HTTPError
			ValueError: Timeout
			ValueError: RequestException

		Returns:
		{
			name: string,
  			meta: { 
				date: string
				md5sum: string
				sha256sum: string
				sha512sum: string
			},
  			strings: [string, string][]
		}
		"""
		files = self.readFile(path)
		data = {}

		if is_unpacking_required:
			data['is_unpacking_required'] = 'true'
			logging.debug('is_unpacking_required: %s', data['is_unpacking_required'])

		if minimum_string_length >=0 and minimum_string_length <=1000:
			data['minimum_string_length'] = str(minimum_string_length)
			logging.debug('minimum_string_length: %s', data['minimum_string_length'])

		else:
			raise ValueError('invalid value for minimum_string_length')

		if strings_to_ignore:
			for i in range(len(strings_to_ignore)):
				data[f'strings_to_ignore[{i}]'] = strings_to_ignore[i]
				logging.debug('strings_to_ignore: %s', data[f'strings_to_ignore[{i}]'])
		
		try:
			response = requests.post(f'{self.API_HOST}/generate-partial-yara-rules', data=data, files=files)
			response.raise_for_status()
		except requests.exceptions.HTTPError as err:
			jsonError = json.loads(err.response.text)
			raise ValueError(jsonError['message'])
		except requests.exceptions.Timeout:
			raise ValueError('timed out')
		except requests.exceptions.RequestException as err:
			raise ValueError(err)

		return response.content

	def uploadAndGetOutput(self, path, endpoint):
		"""Upload the gets the output from the given endpoints

		Args:
			path (string): path to the executable
			endpoint (string): API endpoint

		Raises:
			ValueError: HTTPError
			ValueError: Timeout
			ValueError: RequestException
		"""
		files = self.readFile(path)

		response = None
		logging.info('Uploading %s to API', path)

		try:
			response = requests.post(f'{self.API_HOST}/{endpoint}', files=files)
			response.raise_for_status()
		except requests.exceptions.HTTPError as err:
			jsonError = json.loads(err.response.text)
			raise ValueError(jsonError['message'])
		except requests.exceptions.Timeout:
			raise ValueError('timed out')
		except requests.exceptions.RequestException as err:
			raise ValueError(err)

		return response.content

	def readFile(self, path):
		"""Read the file from given path

		Args:
			path (string): [description]

		Raises:
			path (string): path to the executable
		"""
		if isdir(path):
			raise ValueError('The path specified appears to be a directory and not a file.')
		elif not isfile(path):
			raise ValueError('The file specified for upload does not exist.')

		file_data = None

		logging.debug(f'Reading {basename(path)} into memory.')

		with open(path, "rb") as f:
			file_data = f.read()

		files = {'file': (basename(path), file_data)}

		return files